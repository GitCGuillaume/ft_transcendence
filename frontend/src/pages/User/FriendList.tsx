import React, { useState, useContext, MouseEvent, useEffect } from "react";
import ContextDisplayChannel, { LoadUserGlobal, updateBlackFriendList } from "../../contexts/DisplayChatContext";
import scroll from 'react-scroll';
import { useEventListenerUserInfo } from "../../useHook/useEventListener";
import { FetchError, headerPost } from "../../components/FetchError";
import { directMessage, handleImgError, inviteGame, StatusUser, userProfile } from "../../components/Chat/ListUser";
import { useNavigate } from "react-router-dom";
import "../../css/user.css";

type typeUserInfo = {
	username: string,
	id: number,
	fl: number | null,
	bl: number | null,
	avatarPath: string | null
}

type typeFlBl = {
	id: number,
	fl: number | null,
	bl: number | null,
	User_username: string,
	User_avatarPath: string | null
}

export const listHandle = (event: MouseEvent<HTMLButtonElement>, jwt: string | null,
	setErrorCode: React.Dispatch<React.SetStateAction<number>>,
	type: number,
	userInfo: typeUserInfo,
	setUserInfo: React.Dispatch<React.SetStateAction<typeUserInfo>>,
	lstUserGlobal: {
		id: number, fl: number | null,
		bl: number | null, User_username: string, User_avatarPath: string | null
	}[],
	setLstUserGlobal: React.Dispatch<React.SetStateAction<{
		id: number, fl: number | null,
		bl: number | null, User_username: string, User_avatarPath: string | null
	}[]>>): void => {
	event.preventDefault();

	function updateUserInfo(username: string, id: number,
		friend: number | null, block: number | null, avatarPath: string | null) {
		setUserInfo({
			username: username,
			id: id, fl: friend, bl: block, avatarPath: avatarPath
		});
		updateBlackFriendList({
			id: id,
			fl: friend, bl: block, User_username: username, User_avatarPath: avatarPath
		}, lstUserGlobal, setLstUserGlobal);
	}

	fetch("https://" + location.host + "/api/users/fr-bl-list", {
		method: 'post',
		headers: headerPost(jwt),
		body: JSON.stringify({
			userId: Number(userInfo.id), type: type
		})
	}).then(res => {
		if (res && res.ok)
			return (res.json());
		if (res)
			setErrorCode(res.status);
	}).then((res: { add: boolean, type: number }) => {
		if (res) {
			if (res.add) {
				if (res.type === 1) {
					updateUserInfo(userInfo.username, Number(userInfo.id),
						userInfo.fl, res.type, userInfo.avatarPath);
				} else if (res.type === 2) {
					updateUserInfo(userInfo.username, Number(userInfo.id),
						res.type, userInfo.bl, userInfo.avatarPath);
				}
			} else {
				if (res.type === 1) {
					updateUserInfo(userInfo.username, Number(userInfo.id),
						userInfo.fl, null, userInfo.avatarPath);
				} else if (res.type === 2) {
					updateUserInfo(userInfo.username, Number(userInfo.id),
						null, userInfo.bl, userInfo.avatarPath);
				}
			}
		}
	}).catch(e => console.log(e));
}

const handleClick = (event: React.MouseEvent<HTMLDivElement>,
	userInfo: typeUserInfo,
	setUserInfo: React.Dispatch<React.SetStateAction<typeUserInfo>>): void => {
	event.preventDefault();
	const e: HTMLElement = event.target as HTMLElement;
	const name: string = e.textContent as string;
	//get attributes node
	const attributes: NamedNodeMap = e.attributes as NamedNodeMap;
	/* update userInfo state on click, from the html tree */
	if (userInfo.username === "" || userInfo.username != name) {
		if (attributes.length === 4) {
			setUserInfo({
				username: name,
				id: Number(attributes[0].value),
				fl: Number(attributes[1].value),
				bl: Number(attributes[2].value),
				avatarPath: attributes[3].value
			});
		}
		else
			setUserInfo({ username: name, id: 0, bl: null, fl: null, avatarPath: null });
	}
	else {
		setUserInfo({ username: "", id: 0, bl: null, fl: null, avatarPath: null })
	}
}

type typeButtonsInfo = {
	jwt: string | null,
	userInfo: typeUserInfo
	setUserInfo: React.Dispatch<React.SetStateAction<typeUserInfo>>,
	setErrorCode: React.Dispatch<React.SetStateAction<number>>,
	type: string
}

const ButtonsInfos = (props: typeButtonsInfo) => {
	const navigate = useNavigate();
	const { id, setDisplay, setId } = useContext(ContextDisplayChannel);
	const { lstUserGlobal, setLstUserGlobal } = useContext(ContextDisplayChannel);
	let type = 0;
	if (props.type === "block")
		type = 1;
	else if (props.type === "friend")
		type = 2;

	useEffect(() => {
		if (id && id != "")
			setDisplay(true);
	}, [id]);

	return (<>
		<StatusUser jwt={props.jwt} userId={props.userInfo.id} />
		<button onClick={(e) =>
			userProfile(e, props.userInfo.id, navigate)} className="userInfo">User Profile</button>
		{type && type === 2 && <button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
			listHandle(e, props.jwt, props.setErrorCode,
				type, props.userInfo, props.setUserInfo, lstUserGlobal, setLstUserGlobal)}
			className="userInfo">{(props.userInfo.fl === type ? "Remove " : "Add ") + props.type}
		</button>}
		{type && type === 1 && <button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
			listHandle(e, props.jwt, props.setErrorCode,
				type, props.userInfo, props.setUserInfo, lstUserGlobal, setLstUserGlobal)}
			className="userInfo">{(props.userInfo.bl === type ? "Remove " : "Add ") + props.type}
		</button>}
		{type && type === 2 && <button onClick={(e) => inviteGame(e, props.userInfo.id, props.jwt,
			navigate, props.setErrorCode)}
			className="userInfo">Invite to a game</button>}
		{type && type === 2 &&
			<button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
				directMessage(e, setDisplay,
					setId, props.setErrorCode,
					props.userInfo.id, props.jwt)
			} className="userInfo">Direct message</button>
		}
	</>)
}

const PrintArray = (props: { type: string, lstUserGlobal: Array<typeFlBl> }) => {
	let i: number = 0;
	return (<>
		{props.lstUserGlobal && props.type === "friend" &&
			props.lstUserGlobal.map((usr) => {
				if (usr.fl != null) {
					return (
						<span data-user-id={usr.id}
							data-friend={(usr.fl == null ? "" : usr.fl)}
							data-block={(usr.bl == null ? "" : usr.bl)}
							data-img={(usr.User_avatarPath == null ? "" : usr.User_avatarPath)}
							key={++i}>{usr.User_username}</span>
					)
				}
			}
			)
		}
		{props.lstUserGlobal && props.type === "block" &&
			props.lstUserGlobal.map((usr) => {
				if (usr.bl != null) {
					return (
						<span data-user-id={usr.id}
							data-friend={(usr.fl == null ? "" : usr.fl)}
							data-block={(usr.bl == null ? "" : usr.bl)}
							data-img={(usr.User_avatarPath == null ? "" : usr.User_avatarPath)}
							key={++i}>{usr.User_username}</span>
					)
				}
			}
			)
		}
	</>);
}

function handleSubmit(e: React.FormEvent<HTMLFormElement>,
	setLstUserGlobal: React.Dispatch<React.SetStateAction<Array<typeFlBl>>>,
	jwt: string | null, value: string | null,
	setErrorCode: React.Dispatch<React.SetStateAction<number>>,
	lstUserGlobal: Array<typeFlBl>,
	setLst: React.Dispatch<React.SetStateAction<[]>>
) {
	e.preventDefault();
	if (!e)
		return;
	if (!value || value === "")
		return;
	fetch("https://" + location.host + "/api/users/add-friend", {
		method: 'post',
		headers: headerPost(jwt),
		body: JSON.stringify({
			username: value, type: 2
		})
	}).then(res => {
		if (res && res.ok)
			return (res.json());
		if (res)
			setErrorCode(res.status);
	}).then(res => {
		if (res && res.code === 1)
			setLst(res.err);
		if (res && res.code === 3) {
			updateBlackFriendList({
				id: res.id,
				fl: res.fl, bl: res.bl, User_username: res.User_username, User_avatarPath: res.User_avatarPath
			}, lstUserGlobal, setLstUserGlobal);
			setLst([]);
		}
	}).catch(err => console.log(err));
}

export const Display = (props: {
	jwt: string | null, lstUserGlobal: Array<typeFlBl>,
	userInfo: typeUserInfo,
	setUserInfo: React.Dispatch<React.SetStateAction<typeUserInfo>>,
	setErrorCode: React.Dispatch<React.SetStateAction<number>>,
	type: string
}) => {
	const handleListenerClick = () => {
		props.setUserInfo({ username: "", id: 0, fl: null, bl: null, avatarPath: null });
	}
	const ref: any = useEventListenerUserInfo(handleListenerClick);
	const Element = scroll.Element;
	let i: number = 0;
	const chooseClassName: string = (props.userInfo.username != "" ? "userInfo userInfoClick" : "userInfo");
	return (<>
		<Element name="container" className="element fullBoxListUser" ref={ref}
			onClick={(e: React.MouseEvent<HTMLDivElement>) =>
				handleClick(e, props.userInfo, props.setUserInfo)}>
			<PrintArray lstUserGlobal={props.lstUserGlobal} type={props.type} />
		</Element>
		<div className={chooseClassName} style={{ position: "relative" }}>
			<label className="userInfo">{props.userInfo.username}</label>
			<img src={"/" + props.userInfo.avatarPath}
				srcSet={"/" + props.userInfo.avatarPath + ' 2x'}
				className="avatarList"
				alt={"avatar " + props.userInfo.username}
				onError={handleImgError}
			/>
			<ButtonsInfos jwt={props.jwt} userInfo={props.userInfo} type={props.type}
				setUserInfo={props.setUserInfo} setErrorCode={props.setErrorCode} />
		</div>
	</>
	)
}

const ErrorSubmit = (props: { lstErr: [] }) => {
	let i: number = 0;
	return (<>
		{props.lstErr &&
			props.lstErr.map((err) => (
				<p style={{ color: "red" }} key={++i}>{err}</p>
			))
		}
	</>);
}

export default function FriendList(props: { jwt: string | null }) {
	const { lstUserGlobal, setLstUserGlobal } = useContext(ContextDisplayChannel);
	const [userInfo, setUserInfo] = useState<typeUserInfo>({
		username: "", id: 0, fl: null, bl: null, avatarPath: null
	});
	const [value, setValue] = useState<null | string>(null);
	const [errorCode, setErrorCode] = useState<number>(200);
	const [lstErr, setLstErr] = useState<[]>([]);
	return (<section>
		<h1>Friend List</h1>
		<form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e, setLstUserGlobal
			, props.jwt, value, setErrorCode, lstUserGlobal, setLstErr)}>
			<input type="text" placeholder="Enter username"
				onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
					setValue(e.currentTarget.value)} />
			<input type="submit" value="Add new friend" />
		</form>
		<ErrorSubmit lstErr={lstErr} />
		{errorCode && errorCode >= 400 && <FetchError code={errorCode} />}
		<LoadUserGlobal jwt={props.jwt} />
		<Display jwt={props.jwt} lstUserGlobal={lstUserGlobal}
			userInfo={userInfo} type="friend"
			setUserInfo={setUserInfo} setErrorCode={setErrorCode} />
	</section>);
}