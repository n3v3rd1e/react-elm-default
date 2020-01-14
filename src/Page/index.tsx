import * as Home from "@/Page/Home";
import * as Login from "@/Page/Login";
import * as NotFound from "@/Page/NotFound";
import * as Session from "@/modules/Session";
import * as Settings from "@/Page/Settings";
import * as Router from "@/modules/Router";
import * as User from "@/modules/User";
import { ViewAvatar } from '@/Reusable';
import React from "react";
import {
	Cmd,
	Dispatcher,
	mapMsg,
	PartialDeep,
	view
} from "react-elm-architecture";
import { classNames } from "../reexports";

export { Home, Login, Settings, NotFound };

export type Model = {
	home: Home.Model;
	settings: Settings.Model;
};

export const init = (): [Model, Cmd<Msg>] => {
	return [
		{
			home: Home.init()[0],
			settings: Settings.init()[0]
		},
		Cmd.none()
	];
};

export type Msg =
	| { type: "HOME"; child: Home.Msg }
	| { type: "SETTINGS"; child: Settings.Msg };

export const update = (model: Model, msg: Msg): [Model, Cmd<Msg>] => {
	switch (msg.type) {
		case "HOME": {
			const [home, homeMsg] = Home.update(model.home, msg.child);
			model.home = home;
			return [model, homeMsg.map(homeToMsg)];
		}
		case "SETTINGS": {
			const [settings, settingsMsg] = Settings.update(
				model.settings,
				msg.child
			);
			model.settings = settings;
			return [model, settingsMsg.map(settingsToMsg)];
		}
	}
};

const homeToMsg = (msg: Home.Msg): Msg => ({
	type: "HOME",
	child: msg
});
const settingsToMsg = (msg: Settings.Msg): Msg => ({
	type: "SETTINGS",
	child: msg
});

type ViewProps = {
	model: Model;
	dispatch: Dispatcher<Msg>;
	session: Session.Model;
	onSignIn: () => void;
	onSignOut: () => void;
	route: Router.Model;
	navigate: (route: Router.Model) => void;
};

export const View = view(
	({
		model,
		dispatch,
		session,
		onSignIn,
		onSignOut,
		route,
		navigate
	}: ViewProps) => {
		const homeDispatch = mapMsg(dispatch)(homeToMsg)
		const settingsDispatch = mapMsg(dispatch)(settingsToMsg)

		if (!Session.isLoggedIn(session)) {
			return <Login.View onSignIn={onSignIn} />;
		}

		return (
			<div>
				<ViewHeader
					onSignOut={onSignOut}
					navigation={
						<ViewNavigation navigate={navigate} route={route} />
					}
					user={User.fromSession(Session.as.LoggedIn(session))}
				/>
				<div>
					{Router.Model.match(route, {
						Login: () => (
							<Home.View
								model={model.home}
								dispatch={homeDispatch}
							/>
						),
						Home: () => (
							<Home.View
								model={model.home}
								dispatch={homeDispatch}
							/>
						),
						Settings: () => (
							<Settings.View
								model={model.settings}
								dispatch={settingsDispatch}
							/>
						),
						default: () => <NotFound.View />
					})}
				</div>
			</div>
		);
	}
);

const ViewHeader = view(
	({
		navigation,
		onSignOut,
		user
	}: {
		navigation: JSX.Element;
		onSignOut: () => void;
		user: User.Model;
	}) => {
		return (
			<div className="relative flex h-header-height ai-center bg-white border-b border-sidebar-font-light">
				<div className="center-v jc-between w-full h-full px-4-2">
					{navigation}
					<ViewAvatar
						imgSrc={user.profilePictureURL}
						onClick={() => {}}
					/>
					<div>
						<button onClick={onSignOut}>Sign out</button>
					</div>
				</div>
			</div>
		);
	}
);

const ViewNavigation = view(
	({
		navigate,
		route
	}: {
		navigate: (route: Router.Model) => void;
		route: Router.Model;
	}) => {
		return (
			<div className="flex">
				<span
					className={classNames("cursor-pointer mr-2", {
						underline: Router.Model.is.Home(route)
					})}
					onClick={() => navigate(Router.Model.Home())}
				>
					Home
				</span>
				<span
					className={classNames("cursor-pointer", {
						underline: Router.Model.is.Settings(route)
					})}
					onClick={() => navigate(Router.Model.Settings())}
				>
					Settings
				</span>
			</div>
		);
	}
);

export type Query = Home.Query | Settings.Query;

export const serializeModelToQuery = (
	route: Router.Model,
	model: Model
): Query =>
	Router.Model.match(route, {
		Home: () => Home.serializeModelToQuery(model.home),
		Settings: () => ({ pageTitle: model.settings.title }),
		default: () => ({})
	});

export const deserializeQueryToModel = (
	route: Router.Model,
	query: Query
): PartialDeep<Model> =>
	Router.Model.match(route, {
		Home: () => ({ home: Home.deserializeQueryToModel(query) }),
		Settings: () => ({ settings: Settings.deserializeQueryToModel(query) }),
		default: () => ({})
	});
