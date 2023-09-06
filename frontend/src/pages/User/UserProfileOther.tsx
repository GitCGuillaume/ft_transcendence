import React, { useEffect, useState, useContext, MouseEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FetchError, header, headerPost } from '../../components/FetchError';
import UserContext from '../../contexts/UserContext';
import ContextDisplayChannel, { updateBlackFriendList } from '../../contexts/DisplayChatContext';
import { inviteGame, StatusUser } from '../../components/Chat/ListUser';
import { Achivement_Raw, Match_History_Raw } from './Setting';
import '../../css/user.css';

/* useLocation recover values from url
	useParams will get parameters id from url
*/

type statInfo = {
	level: number,
	rank: number
}

type rawMH = {
	type_game: string,
	t1_username: string,
	t2_username: string,
	t3_username: string
}

type userInfo = {
	username: string,
	userID: number,
	avatarPath: string | null,
	sstat: statInfo,
	match_h: rawMH
}

type nameAchivement = {
	name: string
}

/* display default img if not img loaded */
const handleImgError = (e: any) => {
	const target: HTMLImageElement = e.target as HTMLImageElement;

	if (target) {
		target.srcset = "/upload_avatar/default.png 320w";
		target.src = "/upload_avatar/default.png";
	}
}

type frBl = {
	friend: number | null,
	block: number | null
}

function updateList(res: { add: boolean, type: number },
	otherUser: userInfo, frBl: frBl, lstUserGlobal: any, setLstUserGlobal : any) {
	function updateUserInfo(username: string, id: number,
		friend: number | null, block: number | null, avatarPath: string | null) {
		updateBlackFriendList({
			id: id,
			fl: friend, bl: block,
			User_username: username, User_avatarPath: avatarPath
		}, lstUserGlobal, setLstUserGlobal);
	}
	if (res.type === 2) {
		if (res.add === true)
			updateUserInfo(otherUser.username, Number(otherUser.userID),
				res.type, frBl.block,
				otherUser.avatarPath);
		else
			updateUserInfo(otherUser.username, Number(otherUser.userID),
				null, frBl.block,
				otherUser.avatarPath);
	} else if (res.type === 1) {
		if (res.add === true)
			updateUserInfo(otherUser.username, Number(otherUser.userID),
				frBl.friend, res.type,
				otherUser.avatarPath);
		else
			updateUserInfo(otherUser.username, Number(otherUser.userID),
				frBl.friend, null,
				otherUser.avatarPath);
	}
}

const listHandle = (event: MouseEvent<HTMLButtonElement>, jwt: string | null,
	setErrorCode: React.Dispatch<React.SetStateAction<number>>,
	type: number, id: string, otherUser: userInfo | undefined, frBl: frBl,
	lstUserGlobal: {
		id: number, fl: number | null,
		bl: number | null, User_username: string, User_avatarPath: string | null
	}[],
	setLstUserGlobal: React.Dispatch<React.SetStateAction<{
		id: number, fl: number | null,
		bl: number | null, User_username: string, User_avatarPath: string | null
	}[]>>) => {
	if (!otherUser || !event || !event.target) {
		return;
	}

	fetch("https://" + location.host + "/api/users/fr-bl-list", {
		method: 'post',
		headers: headerPost(jwt),
		body: JSON.stringify({
			userId: Number(id), type: type
		})
	}).then(res => {
		if (res && res.ok)
			return (res.json());
		if (res)
			setErrorCode(res.status);
	}).then((res: { add: boolean, type: number }) => {
		if (res) {
			updateList(res, otherUser, frBl, lstUserGlobal, setLstUserGlobal);
		}
	}).catch(err => console.log(err));
}

const FriendBlockUser = (props: { userCtx: any, id: string, otherUser: userInfo | undefined, jwt: string | null }) => {
	const [errorCode, setErrorCode] = useState<number>(200);
	const { lstUserGlobal, setLstUserGlobal } = useContext(ContextDisplayChannel);
	const [frBl, setFrBl] = useState<frBl>({ friend: null, block: null });
	const navigate = useNavigate();

	const Button = (props: { num: number, jwt: string | null, id: string, otherUser: userInfo | undefined }) => {
		return (
			<button onClick={(e) => {
				listHandle(e, props.jwt, setErrorCode,
					props.num, props.id, props.otherUser, frBl,
					lstUserGlobal, setLstUserGlobal)
			}}
			>
				{props.num === 1 && (frBl.block === 1 ? "Unblock user" : "Block user")}
				{props.num === 2 && (frBl.friend === 2 ? "Remove friend" : "Add friend")}
			</button>
		);
	}
	useEffect(() => {
		if (lstUserGlobal) {
			lstUserGlobal.forEach((value, key) => {
				if (String(value.id) === props.id) {
					setFrBl({ friend: value.fl, block: value.bl });
				}
			});
		}
	}, [JSON.stringify(lstUserGlobal)]);
	if (errorCode >= 400)
		return (<FetchError code={errorCode} />);
	if (props.otherUser) {
		return (<>
			{
				props.userCtx.getUserId() != props.id &&
				<Button num={1} jwt={props.jwt}
					id={props.id} otherUser={props.otherUser} />
			}
			{
				props.userCtx.getUserId() != props.id &&
				<Button num={2} jwt={props.jwt}
					id={props.id} otherUser={props.otherUser} />
			}
			{
				props.userCtx.getUserId() != props.id &&
				<button onClick={(e) =>
					inviteGame(e, Number(props.otherUser?.userID), props.jwt,
						navigate, setErrorCode)}
				>
					Invite to a game
				</button>
			}

		</>);
	}
	return (<></>);
}

const Match_History_Table = (props: Readonly<{ jwt: string | null , id: string}>) => {
	const [raw_MH, setRaw] = useState<Array<rawMH>>();
	const [errorCode, setErrorCode] = useState<number>(200);
	if (props.jwt === null)
		return (<div>Must be logged</div>);
	useEffect(() => {
		fetch('https://' + location.host + `/api/users/get_raw_mh_user/${props.id}`, {headers: header(props.jwt)})
		.then(res => {
			if (res && res.ok)
				return(res.json());
			if (res)
				setErrorCode(res.status);
		}).then((res: Array<rawMH>) => {
			if (res) {
				setRaw(res);
			}
		}).catch(err => console.log(err));
	}, [])
	
	return(
		<table className="profile-table">
			<thead>
				<tr>
					<th>Type Game</th>
					<th>Player One</th>
					<th>Player Two</th>
					<th>Player Victory</th>
				</tr>
			</thead>
			<tbody>
					< Match_History_Raw rawMH={raw_MH}/>
			</tbody>
		</table>
	);
}

const rank_index = ['BRONZE', 'SILVER', 'GOLD'];

const LoadAchivement = (props: {jwt: string | null, setErrorCode: React.Dispatch<React.SetStateAction<number>>, id: string}) => {
	const [listAchivement, setList] = useState<Array<nameAchivement>>();
	useEffect(() => {
		if (props.jwt) {
			fetch('https://' + location.host + '/api/users/achiv-other/' + props.id, {headers: header(props.jwt)})
			.then(res => {
				if (res.ok)
					return(res.json());
				if (res)
					props.setErrorCode(res.status);
			}).then((res) => {
				if (res)
					setList(res);
			}).catch(err => console.log(err));
		}
	}, [props.jwt])

	return(
		<table className="profile-table-2">
			<thead>
				<tr>
					<th>Achivements</th>
				</tr>
			</thead>
			<tbody>
					< Achivement_Raw nameAchivement={listAchivement}/>
			</tbody>
		</table>
	);
}

type rankWin = {
	rankDbByWin: number | undefined,
	rankByRankUser: number | undefined
}

const LoadResultGame = (props: {setErrorCode: React.Dispatch<React.SetStateAction<number>>, id: string, otherUser: userInfo | undefined, jwt: string | null}) => {
	const [vc, setVC] = useState<number>(0);
	const [nb_g, setNb_g] = useState<number | undefined>(undefined);
	const [df, setDf] = useState<number>(0);
	const [rank, setRank] = useState<rankWin>({rankByRankUser: undefined, rankDbByWin: undefined});

	useEffect(() => {
		fetch('https://' + location.host + `/api/users/get-games-nb-other/${props.id}`, {headers: header(props.jwt)})
			.then(res => {
				if (res.ok)
					return(res.text());
				if (res)
					props.setErrorCode(res.status);
			}).then((res) => {
				setNb_g(Number(res));
			}).catch(err => console.log(err));
	}, [])

	useEffect(() => {
		if (typeof nb_g === 'number') {
			fetch('https://' + location.host + `/api/users/get-victory-nb-other/${props.id}`, {headers: header(props.jwt)})
			.then(res => {
				if (res && res.ok)
					return (res.json());
				if (res)
					props.setErrorCode(res.status);
			}).then((res) => {
				if (res) {
					setVC(Number(res.nb));
					setDf(nb_g - vc);
					if (res.rankDbByWin)
						setRank({
							rankDbByWin: res.rankDbByWin.rank,
							rankByRankUser: res?.rankByRankUser.gen
						});
					if (res.rankByRankUser)
						setRank({
							rankDbByWin: res.rankDbByWin.rank,
							rankByRankUser: res?.rankByRankUser.gen
						});
				}
			}).catch(err => console.log(err));
		}
	}, [nb_g, vc])
	return(
		<>
			<ul>
				<li>Nb_Games: {nb_g}</li>
				<li>Victory: {vc}</li>
				<li>Defeat: {df}</li>
				<li>Rank: {props.otherUser && ((props.otherUser?.sstat.rank <= 2) ? rank_index[props.otherUser?.sstat.rank] : props.otherUser?.sstat.rank)}</li>
				<li>Ladder by game won : {(typeof rank.rankDbByWin === "undefined" ? "Not ranked yet" : rank.rankDbByWin)}</li>
				<li>Ladder by rank : {(typeof rank.rankByRankUser === "undefined" ? "Not ranked yet" : rank.rankByRankUser)}</li>
				<li>Level: {props.otherUser?.sstat.level}</li>
			</ul>
			< Match_History_Table jwt={props.jwt} id={props.id}/>
		</>
	);
}

/* Focus user profile */
const UserProfileOther = (props: { jwt: string | null }) => {
	const id = useParams().id as string;
	const [errorCode, setErrorCode] = useState<number>(200);
	const [otherUser, setOtherUser] = useState<userInfo>();
	const userCtx: any = useContext(UserContext);

	if (isNaN(Number(id)))
		return (<span>Wrong type id</span>)
	useEffect(() => {
		fetch(`https://` + location.host + `/api/users/${id}`, { headers: header(props.jwt) })
			.then(res => {
				if (res && res.ok)
					return (res.json());
				if (res)
					setErrorCode(res.status);
			}).then(res => {
				if (res) {
					if (!res.avatarPath)
						res.avatarPath = "";
					setOtherUser(res);
				}
			}).catch(err => console.log(err));
	}, []);

	if (errorCode >= 400)
		return (< FetchError code={errorCode} />);
	if (typeof otherUser != undefined && otherUser?.userID === 0)
		return (<span>No user found</span>);
	return (
		<>
			<h1>{otherUser?.username}</h1>
			{!isNaN(Number(id)) && <StatusUser jwt={props.jwt} userId={Number(id)} />}
			{otherUser?.avatarPath != null && <img
				className="avatar"
				src={'/' + otherUser.avatarPath}
				srcSet={'/' + otherUser.avatarPath + ' 320w'}
				alt={"avatar " + otherUser?.username}
				onError={handleImgError as any}
			/>}
			<LoadResultGame id={id} setErrorCode={setErrorCode} jwt={props.jwt} otherUser={otherUser}/>
			<LoadAchivement setErrorCode={setErrorCode} jwt={props.jwt} id={id}/>
			<FriendBlockUser userCtx={userCtx} id={id} otherUser={otherUser}
				jwt={props.jwt} />

		</>
	);
}

export default UserProfileOther;