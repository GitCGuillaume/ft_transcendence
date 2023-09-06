import React, { useEffect, useRef, useState } from 'react';
import { header, headerPost } from '../FetchError';

type typeUserInfo = {
    username: string,
    role: string | null
}

type AdminCompType = {
    id: string,
    userId: number,
    jwt: string,
    chooseClassName: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    userInfo: typeUserInfo
}

type typeShortProps = {
    channelId: string,
    role: string | null,
    jwt: string,
    focusUserId: number
}
type typeFetchToBack = {
    channelId: string,
    action: string,
    jwt: string,
    userId: number,
    option: string
}

type admPassword = {
    jwt: string,
    id: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>;
}

const handleClick = (event: React.MouseEvent<HTMLButtonElement>, channelId: string,
    action: string, jwt: string, userId: number) => {
    const e: HTMLElement = event.target as HTMLElement;

    fetch('https://' + location.host + '/api/chat-role/role-action', {
        method: 'post',
        headers: headerPost(jwt),
        body: JSON.stringify({
            id: channelId, action: action, time: "", userId: userId
        })
    }).catch(e => console.log(e));
}

const fetchToBackWithTimer = (elem: typeFetchToBack) => {
    fetch('https://' + location.host + '/api/chat-role/role-action', {
        method: 'post',
        headers: headerPost(elem.jwt),
        body: JSON.stringify({
            id: elem.channelId, action: elem.action,
            option: elem.option, userId: elem.userId
        })
    }).catch(e => console.log(e));
}

/*
    Owner part:
        Nommer utilisateur admin
        ne dois pas oublier, lorsque owner quitte un channel, un user est nommé owner, si possible admin
        ptete un bouton nommer utilisateur owner
    Admin part:
        Bannir(durée déterminée)/ kick (durée temps actuel kick - cur == dékick) / mute (durée déterminée), mais pas les owners
*/

const GrantAdmin = (props: { shortPropsVariable: typeShortProps }) => {
    //Need to load current chosen user privilege
    const values = props.shortPropsVariable;
    const privilege = (values.role !== "Administrator" ? "Grant" : "Remove");

    return (<button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
        handleClick(e, values.channelId, privilege,
            values.jwt, values.focusUserId)} className="adminInfoUser">
        {privilege} admin privileges
    </button>);
}

const handleBanMute = (event: React.MouseEvent<HTMLButtonElement>,
    setTime: React.Dispatch<React.SetStateAction<string | null>>,
    ref: React.RefObject<HTMLInputElement>,
    time: string | null) => {
    event.preventDefault();
    const target: HTMLElement = event.target as HTMLElement;

    if (target && time === null) {
        setTime("0");
        if (ref && ref.current)
            ref.current.value = "0";
    }
    else {
        setTime(null);
        if (ref && ref.current)
            ref.current.value = "";
    }
}

const handleSubmitBanMute = (event: React.FormEvent<HTMLFormElement>,
    time: string,
    setTime: React.Dispatch<React.SetStateAction<string | null>>,
    ref: React.RefObject<HTMLInputElement>,
    object: typeFetchToBack) => {
    event.preventDefault();
    if (!event)
        return;
    const target: HTMLElement = event.target as HTMLElement;

    if (!target)
        return;
    if (isNaN(Number(time))) {
        setTime("Not a number");
        if (ref && ref.current)
            ref.current.value = "Not a number";
        return;
    }
    setTime("");
    //fetch (ban) data to backend
    fetchToBackWithTimer({
        channelId: object.channelId,
        action: object.action,
        jwt: object.jwt,
        userId: Number(object.userId),
        option: time
    });
    if (ref && ref.current)
        ref.current.value = "";
}

const BanUser = (props: { shortPropsVariable: typeShortProps }) => {
    const [time, setTime] = useState<string | null>(null);
    const refElem = useRef<HTMLInputElement>(null);
    const object: typeFetchToBack = {
        channelId: props.shortPropsVariable.channelId,
        action: "Ban",
        jwt: props.shortPropsVariable.jwt,
        userId: props.shortPropsVariable.focusUserId,
        option: ""
    }

    useEffect(() => {
        setTime(null);
    }, [props.shortPropsVariable.focusUserId]);
    if (time != null) {
        return (<>
            <button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                handleBanMute(e, setTime, refElem, time)} className="adminInfoUser">Ban user</button>
            <form className='adminBox' onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
                handleSubmitBanMute(e, time, setTime, refElem, object)}>
                <input ref={refElem} type="text" placeholder="in seconds"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setTime(e.currentTarget.value)} />
            </form>
        </>
        );
    }
    return (<button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
        handleBanMute(e, setTime, refElem, time)} className="adminInfoUser">Ban user</button>);
}

const MuteUser = (props: { shortPropsVariable: typeShortProps }) => {
    const [time, setTime] = useState<string | null>(null);
    const refElem = useRef<HTMLInputElement>(null);
    const object: typeFetchToBack = {
        channelId: props.shortPropsVariable.channelId,
        action: "Mute",
        jwt: props.shortPropsVariable.jwt,
        userId: props.shortPropsVariable.focusUserId,
        option: ""
    }

    useEffect(() => {
        setTime(null);
    }, [props.shortPropsVariable.focusUserId]);
    if (time != null) {
        return (<>
            <button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                handleBanMute(e, setTime, refElem, time)} className="adminInfoUser">Mute user</button>
            <form className='adminBox' onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
                handleSubmitBanMute(e, time, setTime, refElem, object)}>
                <input ref={refElem} type="text" placeholder="in seconds"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setTime(e.currentTarget.value)} />
            </form>
        </>
        );
    }
    return (<button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
        handleBanMute(e, setTime, refElem, time)} className="adminInfoUser">Mute user</button>);
}

const fetchKick = (event: React.MouseEvent<HTMLButtonElement>,
    object: typeFetchToBack, askKick: boolean) => {
    const target: HTMLElement = event.target as HTMLElement;

    if (!target)
        return;
    if (askKick === true) {
        fetch('https://' + location.host + '/api/chat-role/role-action', {
            method: 'post',
            headers: headerPost(object.jwt),
            body: JSON.stringify({
                id: object.channelId, action: object.action,
                option: object.option, userId: Number(object.userId)
            })
        }).catch(e => console.log(e));
    }

}

const handleKick = (event: React.MouseEvent<HTMLButtonElement>,
    setAskKick: React.Dispatch<React.SetStateAction<boolean>>,
    askKick: boolean) => {
    event.preventDefault();
    if (!event || !event.target)
        return;
    const target: HTMLElement = event.target as HTMLElement;

    if (target && askKick === false)
        setAskKick(true);
    else
        setAskKick(false);
}

const AskKick = (props: { askKick: boolean, object: typeFetchToBack }) => {
    return (<button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
        fetchKick(e, props.object, props.askKick)}>Confirm kick</button>);
}

const KickUser = (props: { shortPropsVariable: typeShortProps }) => {
    const [askKick, setAskKick] = useState<boolean>(false);
    const object: typeFetchToBack = {
        channelId: props.shortPropsVariable.channelId,
        action: "Kick",
        jwt: props.shortPropsVariable.jwt,
        userId: props.shortPropsVariable.focusUserId,
        option: ""
    }

    useEffect(() => {
        setAskKick(false);
    }, [props.shortPropsVariable.focusUserId])
    if (askKick === true) {
        return (<><button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
            handleKick(e, setAskKick, askKick)} className="adminInfoUser">Kick user</button>
            <AskKick askKick={askKick} object={object} /></>);
    }
    return (<button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
        handleKick(e, setAskKick, askKick)} className="adminInfoUser">Kick user</button>);
}

const AdminButtons = (props: {
    id: string, role: string | null, focusUserId: number,
    userId: number | undefined, userInfo: typeUserInfo, jwt: string
}) => {
    const role: string | null = props.role;
    let haveAdminGrant: boolean = false;
    const shortPropsVariable = {
        channelId: props.id,
        role: props.userInfo.role,
        jwt: props.jwt,
        focusUserId: props.focusUserId
    }
    if (role === "Owner" || role === "Administrator")
        haveAdminGrant = true;
    if (!props.userId
        || props.focusUserId == props.userId
        || !role || props.userInfo.role === "Owner")
        return (<></>);
    return (
        <>
            {role && role === "Owner" && <GrantAdmin shortPropsVariable={shortPropsVariable} />}
            {haveAdminGrant && <BanUser shortPropsVariable={shortPropsVariable} />}
            {haveAdminGrant && <MuteUser shortPropsVariable={shortPropsVariable} />}
            {haveAdminGrant && <KickUser shortPropsVariable={shortPropsVariable} />}
        </>
    )
}

const PasswordExist = (props: {
    jwt: string,
    id: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    setType: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    useEffect(() => {
        fetch('https://' + location.host + '/api/chat-role/get-access-type?' + new URLSearchParams({
            id: props.id,
        }), { headers: header(props.jwt) })
            .then(res => {
                if (res && res.ok)
                    return (res.json());
                if (res && res.status)
                    props.setErrorCode(res.status);
            }).then((res: boolean) => {
                if (typeof res === "boolean")
                    props.setType(res);
            }).catch(err => console.log(err));
    }, [props.id]);
    return (<></>);
}

function submitPsw(e: any | undefined, jwt: string, action: string,
    id: string, psw: string,
    setType: React.Dispatch<React.SetStateAction<boolean>>,
    setErr: React.Dispatch<React.SetStateAction<boolean>>) {
    if (!e)
        return;
    e.preventDefault();

    if (e && e.target) {
        fetch('https://' + location.host + '/api/chat-role/role-action-psw', {
            method: 'post',
            headers: headerPost(jwt),
            body: JSON.stringify({
                id: id, action: action,
                psw: psw
            })
        })
            .then(res => {
                if (res && res.ok)
                    return (res.json());
                if (res && res.status === 400)
                    setErr(true);
            })
            .then(res => {
                if (typeof res === "boolean") {
                    if (action === "setpsw")
                        setType(true);
                    else if (action === "unsetpsw")
                        setType(false);
                    setErr(false);
                }
            })
            .catch(e => console.log(e));
    }
}

const PswBox = (props: {
    jwt: string,
    id: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    typeDisplay: boolean,
    setType: React.Dispatch<React.SetStateAction<boolean>>
}) => {

    const UpdateDeletePsw = () => {
        const [psw, setPsw] = useState<string>("");
        const [err, setErr] = useState<boolean>(false);
        return (<div>
            {props.typeDisplay === true && <h3>Update Password</h3>}
            {props.typeDisplay === false && <h3>Add Password</h3>}
            <form method='post' onSubmit={(e) => submitPsw(e, props.jwt,
                'setpsw', props.id,
                psw, props.setType, setErr)}>
                <input type="password" onChange={(e) => setPsw(e.target.value)}
                    placeholder='Password' name="password" />
                <button type='submit'>Submit</button>
            </form>
            {props.typeDisplay === true &&
                <><h4>Delete Password</h4>
                    <button onClick={(e) => submitPsw(e, props.jwt,
                        'unsetpsw', props.id,
                        'psw', props.setType, setErr)}>Delete</button>
                </>
            }
            {err === true && <><br /><span>Please enter a password</span></>}
        </div>);
    }

    return (<>
        <UpdateDeletePsw />
    </>);
}
/* typeDisplay === true has a psw otherwise no */
/* Used to update / remove password channel by owner */
export const PasswordOwnerBox = (props: admPassword) => {
    const [role, setRole] = useState<string>("");
    const [typeDisplay, setType] = useState<boolean>(false);
    useEffect(() => {
        fetch('https://' + location.host + '/api/chat-role/getRole?' + new URLSearchParams({
            id: props.id,
        }), { headers: header(props.jwt) })
            .then(res => {
                if (res && res.ok)
                    return (res.json());
                if (res && res.status)
                    props.setErrorCode(res.status);
            })
            .then((res) => {
                if (res && res.role) {
                    setRole(res.role);
                }
                else {
                    setRole("");
                }
            }).catch(e => {
                console.log(e);
                props.setErrorCode(9999);
            });
    }, [[props.id]]);
    return (<>
        {role != "Owner" ? <></> :
            <article className='pswBox'>
                <PasswordExist jwt={props.jwt}
                    id={props.id} setErrorCode={props.setErrorCode}
                    setType={setType} />
                <PswBox jwt={props.jwt}
                    id={props.id} setErrorCode={props.setErrorCode}
                    typeDisplay={typeDisplay} setType={setType} />
            </article>}
    </>
    )
}

function fetchGetRole(jwt: string, id: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>) {
    return (fetch('https://' + location.host + '/api/chat-role/getRole?' + new URLSearchParams({
        id: id,
    }), { headers: header(jwt) })
        .then(res => {
            if (res && res.ok)
                return (res.json());
            if (res && res.status)
                setErrorCode(res.status);
        }));
}

function fetchUserRole(jwt: string, userId: number, id: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>) {
    return (fetch('https://' + location.host + '/api/chat-role/get-role-focus?' + new URLSearchParams({
        id: id, idfocus: String(userId)
    }), { headers: header(jwt) })
        .then(res => {
            if (res && res.ok)
                return (res.json());
            if (res && res.status)
                setErrorCode(res.status);
        }));
}

const AdminComponent = (props: AdminCompType) => {
    const [role, setRole] = useState<string | undefined>(undefined);
    const [roleFocus, setRoleFocus] = useState<string | undefined>(undefined);
    const [userId, setUserId] = useState<number | undefined>(undefined);

    useEffect(() => {
        const getRole = () => {
            fetchUserRole(props.jwt, props.userId,
                props.id, props.setErrorCode)
                .then((res: { role: string }) => {
                    if (res)
                        setRoleFocus(res.role);
                    fetchGetRole(props.jwt, props.id, props.setErrorCode)
                        .then((res) => {
                            if (res && res.role) {
                                setUserId(res.userId);
                                setRole(res.role);
                            }
                            else {
                                setUserId(undefined);
                                setRole("");
                            }
                        }).catch(e => console.log(e));
                }).catch(e => console.log(e));
        };
        //check if userInfo box is displayed on client
        if (props.chooseClassName === "userInfo userInfoClick")
            getRole();
        return (() => {
            setRole(undefined);
            setRoleFocus(undefined);
            setUserId(undefined);
        });
    }, [props.userId]);
    return (
        <>
            {(userId && role && !(roleFocus === role)) &&
                (role === "Owner" || role === "Administrator")
                && <AdminButtons id={props.id} focusUserId={props.userId}
                    userId={userId} role={role} userInfo={props.userInfo} jwt={props.jwt} />}
        </>
    );
}

export default AdminComponent;