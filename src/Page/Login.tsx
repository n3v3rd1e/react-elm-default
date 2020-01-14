import React from "react";
import { view } from "react-elm-architecture";

type ViewProps = {
	onSignIn: () => void;
};

export const View = view(({ onSignIn }: ViewProps) => {
	return (
		<div>
			<div>
				<h1>Login Page</h1>
			</div>
			<div>
				<button onClick={onSignIn}>Sign in</button>
			</div>
		</div>
	);
});
