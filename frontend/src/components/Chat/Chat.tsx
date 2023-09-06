import React, { useEffect, useRef, useState, useContext } from 'react';
import ListUserChat from './ListUser';
import { PasswordOwnerBox } from './Admin';
import { FetchError, header, headerPost } from '../FetchError';
import "../../css/chat.css";
import { useLocation, useParams, useNavigate, NavigateFunction } from 'react-router-dom';
import scroll from 'react-scroll';
import SocketContext from '../../contexts/Socket';
import { ContextUserLeave } from '../../contexts/LeaveChannel';
import UserContext from "../../contexts/UserContext";
import ContextDisplayChannel, { LoadUserGlobal } from '../../contexts/DisplayChatContext';
import { commandChat } from './CommandChat';

export type lstMsg = {
    room: string,
    lstMsg: Array<{
        user: { avatarPath: string, username: string }
        content: string,
        img: string
    }>
}

const content_helper = "/cmd + username + option\n"
    + "/block username\n"
    + "/unblock username\n"
    + "/friend username\n"
    + "/unfriend username\n"
    + "/invite username\n"
    + "/profile username\n"

const helper: any = {
    user: {
        avatarPath: null,
        username: "Only visible by you",
    },
    content: content_helper,
}

type msg = {
    user: { avatarPath: string, username: string }
    content: string,
    img: string
}

const handleImgError = (e: any) => {
    if (!e || !e.target)
        return;
    const target: HTMLImageElement = e.target as HTMLImageElement;

    if (target) {
        target.srcset = "/upload_avatar/default.png 2x";
        target.src = "/upload_avatar/default.png";
    }
}

/* return user state list */
export const ListMsg = (props: { lstMsg: any, id: string }) => {
    const scrollBottom = useRef<any>();
    const Element = scroll.Element;
    let EScroll = scroll.animateScroll;
    let i: number = 0;
    let arrayLength: number = props.lstMsg.length - 30;
    if (arrayLength < 0)
        arrayLength = 0;
    useEffect(() => {
        if (scrollBottom && scrollBottom.current)
            EScroll.scrollToBottom({ containerId: "containerElement".concat(props.id), duration: 0 });
    }, [props.lstMsg, props.id, scrollBottom.current])
    return (
        <Element name="container" className="element fullBox"
            id={"containerElement".concat(props.id)}
            ref={scrollBottom}>
            {
                props.lstMsg &&
                props.lstMsg.slice(arrayLength, props.lstMsg.length).map((msg: msg) => (
                    <React.Fragment key={++i}>
                        <div style={{ border: "1px solid black" }}>
                            {<img
                                className="chatBox"
                                src={'/' + msg.user.avatarPath}
                                srcSet={'/' + msg.user.avatarPath + ' 2x'}
                                alt={"avatar " + msg.user?.username}
                                onError={handleImgError as any}
                            />}
                            <label className="chatBox">{msg.user.username}</label>
                        </div>
                        <span className="chatBox" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                    </React.Fragment>
                ))
            }
        </Element>
    )
}

/* Leave chat */
const handleLeave = async (e: React.MouseEvent<HTMLButtonElement>, contextUserLeave: any, usrSocket: any, obj: {
    id: string,
}, navigate: NavigateFunction) => {
    e.preventDefault();
    usrSocket.emit('leaveRoomChat', obj, (res: any) => {
        navigate("/channels");
        contextUserLeave();
    });
}

type typePostMsg = {
    id: string, msg: any,
    usrSocket: any, setMsg: any,
    setLstMsgChat: React.Dispatch<React.SetStateAction<lstMsg[]>>,
    setLstMsgPm: React.Dispatch<React.SetStateAction<lstMsg[]>>,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
}

const PostMsg = (props: typePostMsg) => {
    const refElem = useRef(null);
    const { id, lstUserGlobal, lstUserChat, setLstMsgChat,
        setLstMsgPm, setLstUserGlobal,
        setLstUserChat } = useContext(ContextDisplayChannel);
    const userCtx: any = useContext(UserContext);
    let jwt = userCtx.getJwt();
    const navigate = useNavigate();

    /* Post msg */
    const handleSubmitButton = (e: React.MouseEvent<HTMLButtonElement>,
        obj: any, ref: any) => {
        e.preventDefault();
        let cmdIsValid = true;

        if (obj.content && obj.content === "/help") {
            setLstMsgChat((lstMsg) => [...lstMsg, helper]);
        }
        else if (obj.content && obj.content[0] === '/') {
            cmdIsValid = commandChat(jwt, obj, props.setErrorCode,
                lstUserGlobal, lstUserChat,
                setLstUserGlobal, setLstUserChat, navigate);
            if (cmdIsValid === false) {
                props.usrSocket.emit('sendMsg', obj, (res: lstMsg) => {
                    if (res.room === obj.id)
                        setLstMsgChat((lstMsg) => [...lstMsg, res]);
                    if (res.room === obj.id && obj.id == obj.idBox)
                        setLstMsgPm((lstMsg) => [...lstMsg, res]);
                });
            }
        }
        else {
            props.usrSocket.emit('sendMsg', obj, (res: lstMsg) => {
                if (res.room === obj.id)
                    setLstMsgChat((lstMsg) => [...lstMsg, res]);
                if (res.room === obj.id && obj.id == obj.idBox)
                    setLstMsgPm((lstMsg) => [...lstMsg, res]);
            });
        }
        props.setMsg("");
        ref.current.value = "";
    }

    const handleSubmitArea = (e: React.KeyboardEvent<HTMLTextAreaElement>,
        obj: any, ref: any) => {
        let cmdIsValid = true;

        if (e.key === "Enter" && e.shiftKey === false) {
            e.preventDefault();
            if (obj.content && obj.content === "/help") {
                setLstMsgChat((lstMsg) => [...lstMsg, helper]);
            }
            else if (obj.content && obj.content[0] === '/') {
                cmdIsValid = commandChat(jwt, obj, props.setErrorCode,
                    lstUserGlobal, lstUserChat, setLstUserGlobal,
                    setLstUserChat, navigate);
                if (cmdIsValid === false) {
                    props.usrSocket.emit('sendMsg', obj, (res: lstMsg) => {
                        if (res.room === obj.id)
                            setLstMsgChat((lstMsg) => [...lstMsg, res]);
                        if (res.room === obj.id && obj.id == obj.idBox)
                            setLstMsgPm((lstMsg) => [...lstMsg, res]);
                    });
                }
            } else {
                props.usrSocket.emit('sendMsg', obj, (res: lstMsg) => {
                    if (res.room === obj.id)
                        setLstMsgChat((lstMsg) => [...lstMsg, res]);
                    if (res.room === obj.id && obj.id == obj.idBox)
                        setLstMsgPm((lstMsg) => [...lstMsg, res]);
                });
            }
            props.setMsg("");
            ref.current.value = "";
        }
    }

    return (
        <div className="sendMsg">
            <textarea ref={refElem} id="submitArea" placeholder='Type something...'
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => props.setMsg(e.currentTarget.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                    handleSubmitArea(e,
                        {
                            id: props.id,
                            idBox: id,
                            content: props.msg
                        }, refElem)}
                className="chatBox" name="msg"></textarea>
            <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSubmitButton(e,
                {
                    id: props.id,
                    idBox: id,
                    content: props.msg
                }, refElem)}
                className="chatBox">Go</button>
        </div>
    );
}

const MainChat = (props: any) => {
    const [online, setOnline] = useState<undefined | boolean | string>(undefined)
    const userCtx: any = useContext(UserContext);
    const { usrSocket } = useContext(SocketContext);

    useEffect(() => {
        //subscribeChat
        usrSocket?.emit("joinRoomChat", {
            id: props.id,
            psw: props.psw
        }, (res: any) => {
            if (res.ban === true)
                setOnline("Ban");
            else {
                if (res === true)
                    setOnline(true);
                else
                    setOnline(false);
            }
        });
        return (() => {
            //unsubscribeChat
            setOnline(false);
            usrSocket?.emit("stopEmit", { id: props.id }, () => {
                setOnline(false);
            });
        })
    }, [props.id, usrSocket]);
    const navigate = useNavigate();
    const contextUserLeave = useContext(ContextUserLeave);
    const { lstMsgChat, lstUserGlobal, setLstMsgChat, setLstMsgPm } = useContext(ContextDisplayChannel);
    const [chatName, setChatName] = useState<string>("");

    //LOAD MESSAGES CHANNEL AND CHANNEL NAME
    useEffect(() => {
        const ft_lst = async () => {
            const res = await fetch('https://' + location.host + '/api/chat?' + new URLSearchParams({
                id: props.id,
            }),
                { headers: header(props.jwt) })
                .then(res => {
                    if (res.ok)
                        return (res.json());
                    if (res && res.status)
                        props.setErrorCode(res.status);
                }).catch(e => console.log(e));
            if (typeof res != "undefined" && typeof res.lstMsg != "undefined") {
                setLstMsgChat(res.lstMsg);
                setChatName(res.name);
                if (res.accesstype === "2" || res.accesstype === "3")
                    contextUserLeave();
            } else {
                navigate("/channels");
            }
        }
        if (online === true)
            ft_lst();
        //LISTEN TO ACTION LIKE BAN AND KICK SENT BY BACKEND
        usrSocket?.on("actionOnUser", (res: any) => {
            if ((res.type === "Ban" || res.type === "Kick")
                && userCtx.getUserId() === res.user_id
                && res.room === props.id) {
                navigate("/channels");
                contextUserLeave();
            }
            if (res.room === props.id)
                setLstMsgChat((lstMsg) => [...lstMsg, res]);
        });
        return (() => {
            usrSocket?.off("actionOnUser");
            setLstMsgChat([]);
            setChatName("");
        });
    }, [lstMsgChat.keys, JSON.stringify(lstUserGlobal),
        online, usrSocket]);
    /* Get message from backend, must reload properly when lstUser is updated */
    useEffect(() => {
        usrSocket?.on("sendBackMsg", (res: any) => {
            //need to check if user is blocked
            if (lstUserGlobal && res) {
                let found = lstUserGlobal.find(elem => Number(elem.id) === res.user_id && elem.bl === 1);
                if (!found) {
                    if (res.room === props.id)
                        setLstMsgChat((lstMsg) => [...lstMsg, res]);
                }
            }
        });
        return (() => { usrSocket?.off("sendBackMsg"); });
    }, [JSON.stringify(lstUserGlobal), props.id]);
    const [msg, setMsg] = useState<null | string>("");

    if (online === "Ban")
        return (<article className='containerChat'>You are banned from this chat</article>)
    else if (online === false)
        return (<article className='containerChat'>Unauthorized connection</article>)
    else if (typeof online == "undefined")
        return (<article className='containerChat'>Connecting to chat...</article>)
    return (<>
        <article className='containerChat'>
            <div className="chatName">
                <span style={{ flex: 1, wordBreak: "break-word" }}>{chatName}</span>
                <span style={{ flex: 0 }}>CHANNEL ID: {props.id}</span>
                <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleLeave(e,
                    contextUserLeave, usrSocket, {
                    id: props.id,
                }, navigate)}
                    className='chatLeave'>Leave</button>
            </div>
            <ListMsg lstMsg={lstMsgChat} id={props.id} />
            <PostMsg id={props.id} msg={msg} usrSocket={usrSocket} setErrorCode={props.setErrorCode}
                setMsg={setMsg} setLstMsgChat={setLstMsgChat} setLstMsgPm={setLstMsgPm} />
        </article>
        <article className='right'>
            <LoadUserGlobal jwt={props.jwt} />
            <ListUserChat id={props.id} jwt={props.jwt} />
            <PasswordOwnerBox jwt={props.jwt}
                id={props.id} setErrorCode={props.setErrorCode} />
        </article>
    </>);
}

//Validity password entry 
const onSubmit = async (e: React.FormEvent<HTMLFormElement>
    , value: string | null, jwt: string | null, id: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>): Promise<boolean> => {
    e.preventDefault();

    if (value === "" || value === null)
        return (false);
    return (await fetch("https://" + location.host + "/api/chat/valid-paswd/", {
        method: 'post',
        headers: headerPost(jwt),
        body: JSON.stringify({
            id: id,
            psw: value
        })
    }).then(res => {
        if (res && res.ok)
            return (res.json())
        if (res)
            setErrorCode(res.status);
        return (false);
    }).catch(e => console.log(e)));
}

/* Detect and return if a password for the channel is used
    return a promise 
*/
const hasPassword = async (id: Readonly<string>, jwt: Readonly<string | null>,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>): Promise<boolean> => {
    return (await fetch('https://' + location.host + '/api/chat/has-paswd?' + new URLSearchParams({
        id: id,
    }),
        { headers: header(jwt) })
        .then(res => {
            if (res && res.ok)
                return (res.json());
            if (res)
                setErrorCode(res.status);
        }));
}

const DisplayErrorPasswordBox = (props: { error: boolean }) => {
    if (props.error === true)
        return (<p>Wrong password</p>);
    return (<></>);
}

/* Ne doit pas pouvoir discuter sur le chat même en modifiant pass is valid à true
    besoin backend */
const PasswordBox = (props: Readonly<any>): JSX.Element => {
    const [valid, setValid] = useState(false);
    const [value, setValue] = useState<string | null>(null);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        setValid(false);
        setValue(null);
        setError(false);
    }, [props.id]);
    if (props.hasPsw === true && valid == false) {
        return (<article className='containerChat'>
            <p>This channel require a password</p>
            <form onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
                const result = await onSubmit(e, value, props.jwt, props.id, props.setErrorCode);
                setValid(result);
                (valid === false) ? setError(true) : setError(false);
            }}>
                <label>Password * :</label>
                <input type="password" name="psw"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setValue(e.currentTarget.value)} />
                <input type="submit" />
            </form>
            <DisplayErrorPasswordBox error={error} />
        </article>);
    }
    return (<MainChat id={props.id} getLocation={props.getLocation}
        setErrorCode={props.setErrorCode} jwt={props.jwt}
        psw={value} />);
}

const BlockChat = (props: any) => {
    if (props.hasPsw !== undefined) {
        if (props.hasPsw == false)
            return (<MainChat id={props.id}
                getLocation={props.getLocation}
                setErrorCode={props.setErrorCode} jwt={props.jwt}
                psw="" />);
        else
            return (<PasswordBox id={props.id} hasPsw={props.hasPsw}
                getLocation={props.getLocation}
                setErrorCode={props.setErrorCode} jwt={props.jwt} />);
    }
    return (<></>);
}

const Chat = (props: { jwt: string }) => {
    const getLocation = useLocation();
    const id = useParams().id as string;
    const [errorCode, setErrorCode] = useState<number>(200);
    const [psw, setLoadPsw] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        const hasPass: Promise<boolean> = hasPassword(id, props.jwt, setErrorCode);
        hasPass.then(res => {
            setLoadPsw(res);
        }).catch(e => console.log(e));
        return (() => {
            setLoadPsw(undefined);
        });
    }, [id]);
    if (errorCode >= 400)
        return (<FetchError code={errorCode} />);
    return (<>
        {typeof psw !== "undefined" &&
            <BlockChat id={id} getLocation={getLocation}
                setErrorCode={setErrorCode} jwt={props.jwt}
                hasPsw={psw} />
        }</>);
}

export default Chat;
