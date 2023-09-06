import React from "react";
import { Link } from "react-router-dom";
import  "./buttons.css";

interface LoginButtonProps {
	url: string;
}

export function LoginButton(props: LoginButtonProps) {
	const { url } = props;

	return (
		<a href={url}>
			<button className="button1">LOGIN WITH 42</button>
		</a>
	);
}

export default LoginButton;