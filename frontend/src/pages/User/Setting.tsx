import React, { useEffect, useState, ChangeEvent, FormEvent, useContext, useRef } from "react";
import { FetchError, header } from "../../components/FetchError";
import { useNavigate } from "react-router-dom";
import UserContext from "../../contexts/UserContext";
import '../../css/user.css';
import SocketContext from "../../contexts/Socket";

type statInfo = {
	level: number,
	rank: number
}

type userInfo = {
	username: string,
	token: string,
	userID: number,
	avatarPath: string,
	fa: boolean
	sstat: statInfo
}

type rawMH = {
	type_game: string,
	t1_username: string,
	t2_username: string,
	t3_username: string
}

type nameAchivement = {
	name: string
}

type rankWin = {
	rankDbByWin: number | undefined,
	rankByRankUser: number | undefined
}

/* display default img if not img loaded */

const handleImgError = (e: any) => {
	if (!e || !e.target)
		return;
	const target: HTMLImageElement = e.target as HTMLImageElement;

	if (target) {
		target.srcset = "/upload_avatar/default.png 320w";
		target.src = "/upload_avatar/default.png";
	}
}

export const headerPost = (jwt: Readonly<string | null>) => {
	const header = new Headers({
		Authorization: 'Bearer ' + jwt,
	})
	return (header);
};

/*
	Owner profile
*/

function ChangeHandler(event: ChangeEvent<HTMLInputElement>
	, setFile: React.Dispatch<React.SetStateAction<File | undefined>>) {
	event.preventDefault();
	const target = event.target;

	if (target.files && target.files.length === 1) {
		setFile(target.files[0]);
	}
}

async function update(event: FormEvent<HTMLFormElement>, username: string | undefined,
	userId: number | undefined,
	fileSet: File | undefined, FA: boolean, jwt: string | null,
	setErrorCode: React.Dispatch<React.SetStateAction<number>>,
	setAvatarPath: React.Dispatch<React.SetStateAction<string | null>>,
	setLstErr: React.Dispatch<React.SetStateAction<[]>>, userCtx: { reconnectUser: (arg0: { jwt: any; username: any; userId: number | undefined; }) => void; },
	setTimer: { (value: React.SetStateAction<boolean>): void; (arg0: boolean): void; }, timerOk: boolean) {
	event.preventDefault();

	if (!username || timerOk)
		return;
	const formData = new FormData();
	if (fileSet) {
		formData.append('fileset', fileSet);
	}
	formData.append('fa', JSON.stringify({ fa: FA }));
	formData.append('username', username);
	await fetch('https://' + location.host + '/api/users/update-user',
		{
			method: 'POST',
			headers: headerPost(jwt),
			body: formData,
		}
	).then(res => {
		if (res && res.ok)
			return (res.json());
		if (res)
			setErrorCode(res.status);
	}).then(res => {
		if (res) {
			if (res.valid === true) {
				if (res.img)
					setAvatarPath(res.img);
				else
					setAvatarPath("");
				userCtx.reconnectUser({
					jwt: res.token.access_token,
					username: res.username,
					userId: userId
				});
				setLstErr([]);
				setTimer(true);
				setTimeout(() => setTimer(false), 3000);
			}
			else if (res.valid === false) {
				setLstErr(res.err);
			}
			setErrorCode(res.status);
		}
	}).catch(e => console.log(e));
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

export const Match_History_Raw = (props: { rawMH: Array<rawMH> | undefined }) => {
	let i: number = 0;
	return (<>
		{props.rawMH && props.rawMH.map((val) =>
			<tr key={++i}>
				<td>{val.type_game}</td>
				<td>{val.t1_username}</td>
				<td>{val.t2_username}</td>
				<td>{val.t3_username}</td>
			</tr>
		)}
	</>)
}

const Match_History_Table = (props: Readonly<{ jwt: string | null }>) => {
	const [raw_MH, setRaw] = useState<Array<rawMH>>();
	const [errorCode, setErrorCode] = useState<number>(200);
	if (props.jwt === null)
		return (<div>Must be logged</div>);
	useEffect(() => {
		fetch('https://' + location.host + '/api/users/get_raw_mh', { headers: header(props.jwt) })
			.then(res => {
				if (res && res.ok)
					return (res.json());
				if (res)
					setErrorCode(res.status);
			}).then((res: Array<rawMH>) => {
				if (res) {
					setRaw(res);
				}
			}).catch(err => console.log(err));
	}, [])

	return (
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
				< Match_History_Raw rawMH={raw_MH} />
			</tbody>
		</table>
	);
}

const rank_index = ['BRONZE', 'SILVER', 'GOLD'];

export const Achivement_Raw = (props: { nameAchivement: Array<nameAchivement> | undefined }) => {
	let i: number = 0;
	return (<>
		{props.nameAchivement && props.nameAchivement.map((val) =>
			<tr key={++i}>
				<td>{val.name}</td>
			</tr>
		)}
	</>)
}

const LoadAchivement = (props: { jwt: string | null, setErrorCode: (arg0: number) => void }) => {
	const [listAchivement, setList] = useState<Array<nameAchivement>>();
	useEffect(() => {
		if (props.jwt) {
			fetch('https://' + location.host + '/api/users/achiv/', { headers: header(props.jwt) })
				.then(res => {
					if (res && res.ok)
						return (res.json())
					if (res)
						props.setErrorCode(res.status);
				}).then((res) => {
					if (res)
						setList(res);
				}).catch(err => console.log(err));
		}
	}, [])

	return (
		<table className="profile-table-2">
			<thead>
				<tr>
					<th>Achivements</th>
				</tr>
			</thead>
			<tbody>
				< Achivement_Raw nameAchivement={listAchivement} />
			</tbody>
		</table>
	);
}

const LoadResultGame = (props: { user: userInfo | undefined, setErrorCode: (arg0: number) => void, jwt: string | null }) => {
	const [vc, setVc] = useState<number>(0);
	const [df, setDf] = useState<number>(0);
	const [nb_g, setNb_g] = useState<number | undefined>(undefined);
	const [rank, setRank] = useState<rankWin>({ rankByRankUser: undefined, rankDbByWin: undefined });

	useEffect(() => {
		fetch('https://' + location.host + '/api/users/get-games-nb/', { headers: header(props.jwt) })
			.then(res => {
				if (res.ok)
					return (res.text());
				if (res)
					props.setErrorCode(res.status);
			}).then((res) => {
				setNb_g(Number(res));
			}).catch(err => console.log(err));
	}, []);

	useEffect(() => {
		if (typeof nb_g === 'number') {
			fetch('https://' + location.host + '/api/users/get-victory-nb/', { headers: header(props.jwt) })
				.then(res => {
					if (res && res.ok)
						return (res.json());
					if (res)
						props.setErrorCode(res.status);
				}).then((res) => {
					if (res) {
						setVc(Number(res.nb));
						setDf(nb_g - vc)
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
	}, [nb_g, vc]);

	return (<>
		<ul>
			<li>Nb_Games: {nb_g}</li>
			<li>Victory: {vc}</li>
			<li>Defeat: {df}</li>
			<li>Rank: {props.user && ((props.user?.sstat.rank <= 2) ? rank_index[props.user?.sstat.rank] : props.user?.sstat.rank)}</li>
			<li>Ladder by game won : {(typeof rank.rankDbByWin === "undefined" ? "Not ranked yet" : rank.rankDbByWin)}</li>
			<li>Ladder by rank : {(typeof rank.rankByRankUser === "undefined" ? "Not ranked yet" : rank.rankByRankUser)}</li>
			<li>Level: {props.user?.sstat.level}</li>
		</ul>
		< Match_History_Table jwt={props.jwt} />
	</>)
}

const SetBusy = () => {
	const { usrSocket } = useContext(SocketContext);
	const [isBusy, setIsBusy] = useState<boolean | undefined>(undefined);

	const ft_busy = (e: React.MouseEvent<HTMLButtonElement>) => {
		if (!e || !e.target)
			return;
		usrSocket?.emit("iAmBusy", (res: { isBusy: boolean }) => {
			setIsBusy(res.isBusy);
		});
	}


	useEffect(() => {
		usrSocket?.emit("getBusy", (res: { isBusy: boolean }) => {
			setIsBusy(res.isBusy);
		});
	}, [usrSocket]);
	return (<>
		{typeof isBusy === "boolean" && <article>
			<button onClick={ft_busy}>
				{(isBusy === true ? "Unset busy" : "Set busy")}
			</button>
		</article>
		}
	</>
	);
}

const resetImg = (e: React.MouseEvent<HTMLButtonElement>,
	setFile: React.Dispatch<React.SetStateAction<File | undefined>>,
	ref: any) => {
	if (!e || !e.target)
		return;
	e.preventDefault();
	setFile(undefined);
	if (ref && ref.current) {
		ref.current.value = '';
	}
}

function Setting(props: Readonly<{ jwt: string | null }>) {
	const [user, setUser] = useState<userInfo | undefined>(undefined);
	const [errorCode, setErrorCode] = useState<number>(200);
	const [lstErr, setLstErr] = useState<[]>([]);
	const [avatarPath, setAvatarPath] = useState<string | null>(null);
	const [FA, setFA] = useState<boolean>(false);
	const [oldFa, setOldFa] = useState<boolean>(false);
	const [file, setFile] = useState<File | undefined>(undefined);
	const userCtx: any = useContext(UserContext);
	const [username, setUsername] = useState<string | undefined>("");
	const [timerOk, setTimer] = useState<boolean>(false);
	const navigate = useNavigate();
	const refElem = useRef(null);

	useEffect(() => {
		fetch('https://' + location.host + '/api/users/profile/', { headers: header(props.jwt) })
			.then(res => {
				if (res.ok)
					return (res.json());
				if (res)
					setErrorCode(res.status);
			}).then((res: userInfo) => {
				if (res) {
					if (res.avatarPath)
						setAvatarPath(res.avatarPath);
					else
						setAvatarPath("");
					setUser(res);
					setFA(res.fa);
					setOldFa(res.fa);
					setUsername(userCtx.getUsername());
				}
			}).catch(e => console.log(e));
	}, []);

	useEffect(() => {
		if (FA === true && oldFa === false)
			navigate("/fa-activate");
		setOldFa(FA);
	}, [userCtx.getJwt()]);

	if (errorCode >= 401 && errorCode != 413)
		return (<FetchError code={errorCode} />);
	return (
		<section>
			<h1>{userCtx.getUsername()}</h1>
			<SetBusy />
			<article>
				<LoadResultGame user={user} setErrorCode={setErrorCode} jwt={props.jwt} />
				<LoadAchivement setErrorCode={setErrorCode} jwt={props.jwt} />
			</article>
			<article>
				<form onSubmit={(event: FormEvent<HTMLFormElement>) =>
					update(event, username,
						user?.userID, file, FA, props.jwt,
						setErrorCode, setAvatarPath, setLstErr,
						userCtx, setTimer, timerOk)}>
					<label>Username</label>
					<input
						type="text"
						placeholder="ex: Charly" value={username}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.currentTarget.value)}
					/>
					<label>Update avatar</label>
					<input
						ref={refElem}
						type="file"
						onChange={(event: ChangeEvent<HTMLInputElement>) => ChangeHandler(event, setFile)}
					/>
					<label>
						Enable Two Factor Authentication: 2FA
					</label>
					<input
						type="checkbox"
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFA(prev => !prev)}
						checked={FA}
					/>
					{avatarPath != null && <><br /><img
						className="avatar"
						src={avatarPath}
						srcSet={avatarPath + ' 320w'}
						alt={"avatar " + user?.username}
						onError={handleImgError as any}
					/></>}
					{timerOk === false && <input type="submit" value="Submit" />}
					{timerOk === true && <input type="submit" value="Updating again in 3 seconds..." />}
				</form>
				<button onClick={(e: React.MouseEvent<HTMLButtonElement>) => resetImg(e, setFile, refElem)}>
					Delete picture want to upload
				</button>
				<ErrorSubmit lstErr={lstErr} />
				{errorCode === 400
					&& <p style={{ color: "red" }}>
						Wrong image file format, size or wrong type input.
					</p>
				}
				{errorCode === 413
					&& <p style={{ color: "red" }}>
						Image is too large, please upload a size inferior to 1MB.
					</p>
				}
			</article>
		</section>);
}

export default Setting;
