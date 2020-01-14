import * as React from 'react';
import { view } from "react-elm-architecture";



export const ViewAvatar = view(({ onClick, imgSrc }) => {
	return (
		<img
			width="48px"
			height="48px"
			onClick={onClick}
			className="cursor-pointer rounded-full"
			src={imgSrc}
			alt="avatar"
		></img>
	);
});