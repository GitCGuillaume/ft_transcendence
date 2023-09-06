import React, { ChangeEvent, FormEvent, useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../contexts/UserContext';
import { FetchError, header } from '../FetchError';

function ChangeHandler(event: ChangeEvent<HTMLInputElement>
	, setFile: React.Dispatch<React.SetStateAction<File | undefined>>) {
	event.preventDefault();
	if (!event || !event.target)
		return;
	const target = event.target;

	if (target.files && target.files.length === 1) {
		setFile(target.files[0]);
	}
}

const headerPost = (jwt: Readonly<string | null>) => {
	const header = new Headers({
		Authorization: 'Bearer ' + jwt,
	})
	return (header);
};

function update(event: FormEvent<HTMLFormElement>, username: string, userCtx: any, userId: string | null,
	fileSet: File | undefined, FA: boolean, jwt: string | null,
	setErrorCode: React.Dispatch<React.SetStateAction<number>>,
	setLstErr: React.Dispatch<React.SetStateAction<[]>>) {
	event.preventDefault();

	const formData = new FormData();
	if (fileSet) {
		formData.append('fileset', fileSet);
	}
	formData.append('fa', JSON.stringify({ fa: FA }));
	formData.append('username', username);
	fetch('https://' + location.host + '/api/users/firstlogin',
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
				userCtx.reconnectUser({
					jwt: res.token.access_token,
					username: res.username,
					userId: userId
				});
				setLstErr([]);
			} else if (res.valid === false) {
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

function FirstConnectionPage(props: Readonly<{ jwt: string | null }>) {
	const [errorCode, setErrorCode] = useState<number>(200);
	const [username, setUsername] = useState<string>("");
	const [FA, setFA] = useState<boolean>(false);
	const [file, setFile] = useState<File | undefined>(undefined);
	const userCtx: any = useContext(UserContext);
	const [lstErr, setLstErr] = useState<[]>([]);
	const navigate = useNavigate();
	const refElem = useRef(null);

	//check if user already have username
	useEffect(() => {
		fetch('https://' + location.host + '/api/users/first-profile/',
			{ headers: header(props.jwt) })
			.then(res => {
				if (res.ok)
					return (res.json());
				if (res)
					setErrorCode(res.status);
			})
			.then((res) => {
				if (res
					&& res.username != "" && res.username != null) {
					navigate('/');
				}
			}).catch(e => console.log(e));
	}, []);

	useEffect(() => {
		if (userCtx.getUsername() != "")
			if (FA === true)
				navigate("/fa-activate");
			else {
				navigate("/");
			}
	}, [userCtx.getJwt()]);

	if (errorCode >= 401 && errorCode != 413)
		return (<FetchError code={errorCode} />);
	return (
		<section>
			<article>
				<form onSubmit={(event: FormEvent<HTMLFormElement>) =>
					update(event, username, userCtx, userCtx.getUserId(),
						file, FA, props.jwt,
						setErrorCode, setLstErr)}>
					<label htmlFor="username">Username</label><br />
					<input type="text" id="username" name="username" placeholder="ex: Charly"
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => { e.preventDefault(); setUsername(e.currentTarget.value) }} /><br /><br />
					<input type="checkbox" id="twofactor"
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFA(prevCheck => !prevCheck)} />
					<label htmlFor="twofactor">Enable Two Factor Authentication: 2FA</label><br /><br />
					<input type="file" name="uploadAvatar"
						ref={refElem}
						onChange={(event: ChangeEvent<HTMLInputElement>) => ChangeHandler(event, setFile)} />
					<input type="submit" value="Submit" />
				</form>
				<button onClick={(e: React.MouseEvent<HTMLButtonElement>) => resetImg(e, setFile, refElem)}>
					Delete picture want to upload
				</button>
				<ErrorSubmit lstErr={lstErr} />
				{errorCode === 400
					&&
					<p style={{ color: "red" }}>
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

export default FirstConnectionPage;