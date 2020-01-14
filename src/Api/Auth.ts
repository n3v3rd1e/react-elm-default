import {
	CognitoAccessToken,
	CognitoAuth,
	CognitoAuthSession,
	CognitoIdToken
} from "amazon-cognito-auth-js";
import jwtDecode from "jwt-decode";
import { AxiosPromise } from "axios";

type Auth = CognitoAuth;
export type Session = CognitoAuthSession;

export const requestWithCognito = <R>(
	request: (authorizationToken: string) => AxiosPromise<R>
): Promise<R> => {
	return new Promise<R>((res, rej) => {
		const auth = getAuth();
		const idTokenExpiration = getTokenExpiration(
			auth.getSignInUserSession().getIdToken()
		);
		const refreshToken = auth
			.getSignInUserSession()
			.getRefreshToken()
			.getToken();

		if (
			idTokenExpiration &&
			expiresWithinFiveMinutes(idTokenExpiration) &&
			refreshToken
		) {
			auth.userhandler = {
				onSuccess: session => {
					request(session.getIdToken().getJwtToken())
						.then(result => res(result.data))
						.catch(rej);
				},
				onFailure: rej
			};
			auth.refreshSession(refreshToken);
			return;
		}
		request(
			auth
				.getSignInUserSession()
				.getIdToken()
				.getJwtToken()
		)
			.then(result => res(result.data))
			.catch(rej);
	});
};

export const getAuth = (): Auth => {
	const auth = new CognitoAuth({
		AppWebDomain: process.env.REACT_APP_APP_WEB_DOMAIN_URL as string,
		TokenScopesArray: ["openid", "profile", "email"],
		RedirectUriSignIn: process.env.REACT_APP_LOGIN_REDIRECT_URL as string,
		RedirectUriSignOut: process.env.REACT_APP_LOGOUT_REDIRECT_URL as string,
		IdentityProvider: "Google",
		UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
		ClientId: process.env.REACT_APP_COGNITO_APP_CLIENT_ID as string
	});

	auth.useCodeGrantFlow();
	auth.userhandler = {
		onFailure: () => {},
		onSuccess: () => {}
	};
	return auth;
};

export const initialCheck = (): Promise<Session> => {
	return new Promise((res, rej) => {
		const auth = getAuth();
		if (auth.isUserSignedIn()) {
			res(auth.getSignInUserSession());
			return;
		}
		const refreshToken = auth
			.getSignInUserSession()
			.getRefreshToken()
			.getToken();

		const idTokenExpiration = getTokenExpiration(
			auth.getSignInUserSession().getIdToken()
		);

		if (
			idTokenExpiration &&
			expiresWithinFiveMinutes(idTokenExpiration) &&
			refreshToken
		) {
			auth.refreshSession(refreshToken);
			res(auth.getSignInUserSession());
			return;
		}

		if (!window.location.search.startsWith("?code=")) {
			rej();
			return;
		}
		auth.userhandler = {
			onSuccess: (session: Session) => {
				const path = window.localStorage.getItem("path");
				const query = window.localStorage.getItem("query");
				window.location.replace(`${path}${query}`);
				res(session);
			},
			onFailure: rej
		};
		auth.parseCognitoWebResponse(window.location.href);
	});
};

export const signIn = (): Promise<Session> => {
	const auth = getAuth();

	if (auth.isUserSignedIn()) {
		return Promise.resolve(auth.getSignInUserSession());
	}

	if (
		auth
			.getSignInUserSession()
			.getRefreshToken()
			.getToken()
	) {
		return new Promise<Session>((res, rej) => _signIn(auth)(rej)(res));
	}
	return new Promise<Session>((res, rej) => _signIn(auth)(rej)(res));
};

const _signIn = (auth: Auth) => (onFailure: (err: any) => void) => (
	onSuccess: (session: Session) => void
): void => {
	auth.userhandler = {
		onFailure,
		onSuccess
	};
	window.localStorage.setItem("path", window.location.pathname.slice(1));
	window.localStorage.setItem("query", window.location.search);
	auth.getSession();
};

export const signOut = (): Promise<Session> => {
	return new Promise((res, rej) => {
		getAuth().signOut();
		rej();
	});
};

type UserData = {
	email: string;
	given_name: string;
	family_name: string;
	picture: string;
};

export const getUser = (session: Session): UserData =>
	jwtDecode(getIdToken(session));

export const getIdToken = (session: Session): string => {
	if (session.getIdToken) {
		return session.getIdToken().getJwtToken();
	} 
	// @ts-ignore
	return session.idToken.getJwtToken();
}

const getTokenExpiration = (token: CognitoAccessToken | CognitoIdToken) =>
	(token.getJwtToken() !== "" && token.getExpiration() * 1000) || 0;

const expiresWithinFiveMinutes = (expiration: number) => {
	const now = new Date().valueOf();
	const fiveMinutes = 5 * 60 * 1000;
	return now + fiveMinutes > expiration;
};
