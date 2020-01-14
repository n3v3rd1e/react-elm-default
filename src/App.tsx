import * as Api from "@/Api";
import * as Page from "@/Page";
import * as Router from "@/modules/Router";
import * as Session from "@/modules/Session";
import React from "react";
import {
	Cmd,
	Dispatcher,
	mapMsg,
	run as Program,
	Sub,
	view,
	noCmd,
	PartialDeep
} from "react-elm-architecture";
import { devTools } from "./Devtools";

type Model = {
	session: Session.Model;
	route: Router.Model;
	page: Page.Model;
};

const init = (session?: Session.Session) => (): [Model, Cmd<Msg>] => {
	const [page, pageCmd] = Page.init();
	return [
		{
			session: Session.init(session)[0],
			route: Router.init(Router.Model.Login())[0],
			page
		},
		Cmd.batch([pageCmd.map(pageToMsg)])
	];
};

type Msg =
	| { type: "SESSION"; child: Session.Msg }
	| { type: "ROUTE"; child: Router.Msg }
	| { type: "PAGE"; child: Page.Msg };

const update = (model: Model, msg: Msg): [Model, Cmd<Msg>] => {
	switch (msg.type) {
		case "SESSION": {
			const [session, sessionCmd] = Session.update(
				model.session,
				msg.child
			);
			model.session = session;
			return [model, sessionCmd.map(sessionToMsg)];
		}
		case "ROUTE": {
			model.route = Router.update(model.route, msg.child)[0];
			return noCmd(model);
		}
		case "PAGE": {
			const [page, pageCmd] = Page.update(model.page, msg.child);
			model.page = page;
			return [model, pageCmd.map(pageToMsg)];
		}
	}
};

const sessionToMsg = (msg: Session.Msg): Msg => ({
	type: "SESSION",
	child: msg
});
const pageToMsg = (msg: Page.Msg): Msg => ({ type: "PAGE", child: msg });

type ViewProps = { model: Model; dispatch: Dispatcher<Msg> };

const View = view(({ model, dispatch }: ViewProps) => {
	return (
		<div className="text-blue-200">
			<Page.View
				model={model.page}
				dispatch={mapMsg(dispatch)(pageToMsg)}
				session={model.session}
				route={model.route}
				onSignIn={() =>
					dispatch({ type: "SESSION", child: Session.signIn() })
				}
				onSignOut={() =>
					dispatch({ type: "SESSION", child: Session.signOut() })
				}
				navigate={route =>
					dispatch({ type: "ROUTE", child: Router.navigate(route) })
				}
			/>
		</div>
	);
});

const subscriptions = (model: Model): Sub<Msg> => {
	return Sub.none();
};

type InitialProps = {
	session?: Api.Auth.Session;
};

export const App = view(({ session }: InitialProps) => {
	return (
		<Program
			init={init(session)}
			view={View}
			router={{
				serializeModelToUrl,
				deserializeUrlToModel
			}}
			update={update}
			subscriptions={subscriptions}
			devTools={devTools}
		/>
	);
});

type Url<U> = {
	path: string;
	query: U;
};

type UrlQuery = Page.Query;

const serializeModelToUrl = (model: Model): Url<UrlQuery> => ({
	path: Router.routeToPath(model.route),
	query: Page.serializeModelToQuery(model.route, model.page)
});

const deserializeUrlToModel = ({
	path,
	query
}: Url<UrlQuery>): PartialDeep<Model> => ({
	route: Router.pathToRoute(path),
	page: Page.deserializeQueryToModel(Router.pathToRoute(path), query)
});
