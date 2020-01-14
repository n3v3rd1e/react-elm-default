import * as Page from "@/Page";
import { Cmd, noCmd } from "react-elm-architecture";
import { unionize, UnionOf } from "unionize";

export const Model = unionize({
	Home: {},
	Login: {},
	Settings: {},
	NotFound: {}
});

export type Model = UnionOf<typeof Model>;

export const init = (
	route: Model = Model.Home(Page.Home.init())
): [Model, Cmd<Msg>] => {
	return [route, Cmd.none()];
};

export type Msg = { type: "SET_ROUTE"; payload: Model };

export const update = (model: Model, msg: Msg): [Model, Cmd<Msg>] => {
	switch (msg.type) {
		case "SET_ROUTE":
			return noCmd(msg.payload);
	}
};

export const navigate = (route: Model): Msg => ({
	type: "SET_ROUTE",
	payload: route
});

export const pathToRoute = (path: string) => {
	switch (path) {
		case "":
			return Model.Home();
		case "login":
			return Model.Login();
		case "settings":
			return Model.Settings();
		default:
			return Model.NotFound();
	}
};

export const routeToPath = (route: Model) =>
	Model.match(route, {
		Home: () => "",
		Settings: () => "settings",
		Login: () => "login",
		default: () => "404"
	});
