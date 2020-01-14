import * as Api from "@/Api";
import { Cmd, noCmd, Result, Task } from "react-elm-architecture";
import { ofType, unionize, UnionOf } from "unionize";

const Model = unionize({
	NotLoggedIn: {},
	LoggedIn: ofType<Session>()
});

export const as = Model.as;

export const isLoggedIn = Model.match({
	NotLoggedIn: () => false,
	LoggedIn: () => true
});

export type Model = UnionOf<typeof Model>;
export type Session = Api.Auth.Session;

export const init = (session?: Session): [Model, Cmd<Msg>] =>
	session ? noCmd(Model.LoggedIn(session)) : noCmd(Model.NotLoggedIn());

export type Msg =
	| { type: "SIGN_IN_CLICKED" }
	| { type: "SIGN_OUT_CLICKED" }
	| { type: "SET_TO_SIGNED_IN"; payload: Session }
	| { type: "SET_TO_NOT_SIGNED_IN" };

export const update = (model: Model, msg: Msg): [Model, Cmd<Msg>] => {
	switch (msg.type) {
		case "SIGN_IN_CLICKED":
			return [model, signInCmd()];
		case "SIGN_OUT_CLICKED":
			return [model, signOutCmd()];
		case "SET_TO_NOT_SIGNED_IN": {
			model = Model.NotLoggedIn();
			return noCmd(model);
		}
		case "SET_TO_SIGNED_IN": {
			model = Model.LoggedIn(msg.payload);
			return [model, Cmd.none()];
		}
	}
};

const handleSignIn = (r: Result<any, Session>): Msg => {
	return r.tag === "Err"
		? { type: "SET_TO_NOT_SIGNED_IN" }
		: { type: "SET_TO_SIGNED_IN", payload: r.value };
};

export const signIn = (): Msg => ({ type: "SIGN_IN_CLICKED" });
export const signOut = (): Msg => ({ type: "SIGN_OUT_CLICKED" });

const signInCmd = () =>
	Task.attempt(Task.fromPromise(Api.Auth.signIn), handleSignIn);

const signOutCmd = () =>
	Task.attempt(Task.fromPromise(Api.Auth.signOut), handleSignIn);
