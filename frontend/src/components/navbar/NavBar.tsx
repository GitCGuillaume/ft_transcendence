import React, { useContext, MouseEvent } from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";
import UserContext from "../../contexts/UserContext";

export default function NavBar(props: {
	click: boolean,
	setClick: React.Dispatch<React.SetStateAction<boolean>>
}) {
	const userCtx: any = useContext(UserContext);
	let jwt = userCtx.getJwt();

	const chooseClassName: string =
		(props.click === true ? "navbar navbar-click" : "navbar");

	const hancleClick = (e: MouseEvent<HTMLDivElement>) => {
		if (e && e.target) {
			props.setClick(prev => !prev);
		}
	}

	if (!jwt || jwt === "") {
		return (
			<nav className={chooseClassName}>
				<div className="navbar-btn"
					onClick={hancleClick}><span className="navbar-line"></span></div>
				<ul className={chooseClassName}>
					<NavBarLink to="/">Home</NavBarLink>
					<NavBarLink to="/login">Log In</NavBarLink>
				</ul>
			</nav>
		)
	}
	return (
		<nav className={chooseClassName}>
			<div className="navbar-btn"
				onClick={hancleClick}><span className="navbar-line"></span></div>
			<ul className={chooseClassName}>
				<NavBarLink to="/profile">User Profile</NavBarLink>
				<NavBarLink to="/">Home</NavBarLink>
				<NavBarLink to="/FriendList">FriendList</NavBarLink>
				<NavBarLink to="/BlackList">BlackList</NavBarLink>
				<NavBarLink to="/channels">Channels</NavBarLink>
				<NavBarLink to="/matchmaking">Matchmaking</NavBarLink>
				<NavBarLink to="/play">Play</NavBarLink>
				<NavBarLink to="/logout">Log Out</NavBarLink>
			</ul>
		</nav>
	)
}

function NavBarLink({ to, children, ...props }: any) {
	const resolvedPath = useResolvedPath(to);
	const isActive = useMatch({ path: resolvedPath.pathname, end: true });

	return (
		<div className={isActive ? "navbar_item navbar_item_active" : "navbar_item"}>
			<Link className="navbar_link" to={to} {...props}>
				{children}
			</Link>
		</div>
	)
}