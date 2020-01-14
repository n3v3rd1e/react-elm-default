import React from "react";
import {
	view,
	Cmd,
	Dispatcher,
	noCmd,
	PartialDeep
} from "react-elm-architecture";

export type Model = {
	title: string;
};

export const init = (
	{ title = "Settings page" }: Partial<Model> = {
		title: "Settings page"
	}
): [Model, Cmd<Msg>] =>
	noCmd({
		title
	});

export type Msg = { type: "SET_TITLE"; payload: string };

export const update = (model: Model, msg: Msg): [Model, Cmd<Msg>] => {
	switch (msg.type) {
		case "SET_TITLE":
			model.title = msg.payload;
			return [model, Cmd.none()];
	}
};

type ViewProps = {
	model: Model;
	dispatch: Dispatcher<Msg>;
};

export const View = view(({ model, dispatch }: ViewProps) => {
	return (
		<div>
			<div>
				<h1>{model.title}</h1>
			</div>
		</div>
	);
});

export type Query = {
	pageTitle?: string;
};

export const serializeModelToQuery = (model: Model): Query => ({
	pageTitle: model.title || undefined
});

export const deserializeQueryToModel = (query: Query): PartialDeep<Model> => ({
	title: query.pageTitle || ""
});
