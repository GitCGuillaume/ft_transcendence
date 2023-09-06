import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../contexts/UserContext';
import { FetchError, headerPost, header } from '../FetchError';

const handleChange = (event: React.ChangeEvent<HTMLInputElement> | undefined,
    setCode: React.Dispatch<React.SetStateAction<number | null>>) => {
    if (!event || !event.target)
        return;
    event.preventDefault();
    const target = event?.currentTarget;

    if (target && !isNaN(Number(target.value))) {
        setCode(Number(target.value));
    } else {
        setCode(0);
    }
}

const handleSubmit = (event: React.FormEvent<HTMLFormElement>, code: number | null,
    jwt: string | null, userId: number, userCtx: any,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    setValid: React.Dispatch<React.SetStateAction<boolean | undefined>>) => {
    if (!event || !event.target)
        return;
    event.preventDefault();
    const target = event?.currentTarget;
    if (!target)
        return;
    if (code && !isNaN(code)) {
        fetch('https://' + location.host + '/api/users/valid-fa-code',
            {
                method: 'POST',
                headers: headerPost(jwt),
                body: JSON.stringify({
                    code: code
                }),
            }
        ).then(res => {
            if (res && res.ok)
                return (res.json());
            if (res)
                setErrorCode(res.status);
        }).then(res => {
            if (res) {
                if (res.token) {
                    userCtx.reconnectUser({
                        jwt: res.token.access_token,
                        username: res.username,
                        userId: userId
                    });
                }
                setValid(res.valid);
            }
        }).catch(e => {
            setValid(false);
        });
    } else {
        setValid(false);
    }
}

function FaCode(props: { jwt: string | null }) {
    const userCtx: any = useContext(UserContext);
    const [valid, setValid] = useState<boolean | undefined>(undefined);
    const [code, setCode] = useState<number | null>(null);
    const [errorCode, setErrorCode] = useState<number>(200);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('https://' + location.host + '/api/users/check-fa/',
            { headers: header(props.jwt) })
            .then(res => {
                if (res && !res.ok)
                    setErrorCode(res.status);
            }).catch(err => console.log(err));
    }, []);

    useEffect(() => {
        if (valid === true) {
            navigate("/");
        }
    }, [userCtx.getJwt(), valid]);
    return (<>
        {errorCode >= 401 && <FetchError code={errorCode} />}
        <span>Please enter the code from your authenticator</span>
        <form onSubmit={(e) => handleSubmit(e, code, props.jwt, userCtx.getUserId(), userCtx,
            setErrorCode, setValid)}>
            <input type="text" onChange={(e) => handleChange(e, setCode)} />
            <input type="submit" />
        </form>
        {valid === false && <span>Authenticator code is wrong</span>}
    </>);
}

export default FaCode;