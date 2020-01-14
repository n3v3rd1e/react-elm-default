import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import "./styles/index.less";
import * as serviceWorker from "./serviceWorker";
import * as Api from "./Api";

Api.Auth.initialCheck()
	.then((res: Api.Auth.Session) => {
		ReactDOM.render(<App session={res} />, document.getElementById("root"));
	})
	.catch(() => {
		ReactDOM.render(<App session={undefined} />, document.getElementById("root"));
	})

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
