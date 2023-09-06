import React, { useState, MouseEvent, useContext, useEffect, useRef } from 'react';
import { FetchError, header } from '../FetchError';
import { lstMsg, ListMsg } from './Chat';
import "../../css/directMessage.css";
import ContextDisplayChannel, { LoadUserGlobal } from '../../contexts/DisplayChatContext';
import scroll from 'react-scroll';
import SocketContext from '../../contexts/Socket';
import { useLocation, useNavigate } from 'react-router-dom';
import UserContext from '../../contexts/UserContext';
import { commandChat } from './CommandChat';
import { Socket } from 'socket.io-client';

type settingChat = {
    width: number,
    height: number,
    opacity: number,
    jwt: string,
}

type settingBox = {
    render: boolean,
    id: string,
    width: number,
    height: number,
    opacity: number,
    jwt: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    setId: React.Dispatch<React.SetStateAction<string>>
}

type listPm = {
    chatid: string,
    user: {
        username: string,
    }
}

type listChan = {
    id: string,
    name: string,
}

type propsListChannel = {
    jwt: string
    listPm: Array<{
        chatid: string,
        user: {
            username: string
        },
    }>,
    listChannel: Array<{
        id: string,
        name: string,
    }>,
    setChannel: React.Dispatch<React.SetStateAction<listChan[]>>,
    setId: React.Dispatch<React.SetStateAction<string>>,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    setPm: React.Dispatch<React.SetStateAction<listPm[]>>
}

const content_helper = "/cmd + username + option\n"
    + "/block username\n"
    + "/unblock username\n"
    + "/friend username\n"
    + "/unfriend username\n"
    + "/invite username\n"
    + "/profile username\n"
    + "/leavePm (Only for private messages)\n";

const helper: any = {
    user: {
        avatarPath: null,
        username: "Only visible by you",
    },
    content: content_helper,
}

const directMessage = (event: MouseEvent<HTMLButtonElement>,
    renderDirectMessage: boolean, setDisplay: any): void => {
    event.preventDefault();

    if (renderDirectMessage === true)
        setDisplay(false)
    else
        setDisplay(true);
}

const Button = () => {
    const { renderDirectMessage, setDisplay } = useContext(ContextDisplayChannel);

    return (
        <button onClick={
            (e: React.MouseEvent<HTMLButtonElement>) =>
                directMessage(e,
                    renderDirectMessage,
                    setDisplay)
        }>X</button>
    );
}

const handleSubmitPmUser = (e: React.FormEvent<HTMLFormElement>, user: string, jwt: string,
    listPm: Array<{
        chatid: string,
        user: {
            username: string
        },
    }>,
    setId: React.Dispatch<React.SetStateAction<string>>,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    setPm: React.Dispatch<React.SetStateAction<listPm[]>>) => {
    e.preventDefault();
    if (!user || user === "")
        return;
    fetch('https://' + location.host + '/api/chat/find-pm-username?' + new URLSearchParams({
        username: String(user)
    }), { headers: header(jwt) })
        .then(res => {
            if (res && res.ok)
                return (res.json());
            if (res)
                setErrorCode(res.status);
        }).then((res: {
            valid: boolean,
            channel_id: string, listPm: {
                chatid: string,
                user: {
                    username: string
                },
            }
        }) => {
            if (res && res.valid === true) {
                setId(res.channel_id);
                let found: any = undefined;
                if (listPm) {
                    found = listPm.find(elem =>
                        elem.chatid === res.channel_id);
                }
                if (typeof found == "undefined")
                    setPm((listPm) => [...listPm, res.listPm]);
            }

        }).catch(e => console.log(e));
}

const BoxPmUser = (props: {
    setId: React.Dispatch<React.SetStateAction<string>>,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    setPm: React.Dispatch<React.SetStateAction<listPm[]>>,
    listPm: Array<{
        chatid: string,
        user: {
            username: string
        },
    }>,
    jwt: string
}) => {
    const [user, setUser] = useState<string>("");

    return (
        <form className='formPm' onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
            handleSubmitPmUser(e, user, props.jwt, props.listPm,
                props.setId, props.setErrorCode, props.setPm)}>
            <input type="text" placeholder='Direct message a user' name="user"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setUser(e?.target?.value)} />
            <input type="submit" value="Search User" />
        </form>
    );
}

const handleClick = (event: React.MouseEvent<HTMLUListElement>,
    setId: React.Dispatch<React.SetStateAction<string>>) => {
    event.preventDefault()
    const target: HTMLElement = event.target as HTMLElement;
    setId(target.id);
}

type HandleUpdate = {
    setChannel: React.Dispatch<React.SetStateAction<listChan[]>>,
    setPm: React.Dispatch<React.SetStateAction<listPm[]>>,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>
}

const handleUpdate = (e: React.MouseEvent<HTMLButtonElement>,
    setChannel: HandleUpdate["setChannel"], setPm: HandleUpdate["setPm"],
    jwt: string | null, setErrorCode: HandleUpdate["setErrorCode"]) => {
    if (e && e.target)
        updateChannel(setChannel, setPm, jwt, setErrorCode);
}

const ListDiscussion = (props: propsListChannel) => {
    const Element = scroll.Element;
    let i = 0;

    return (<div className='listDiscussion'>
        <span>Privates messages</span>
        <Element name="container" className="element" style={
            { overflowY: 'scroll', overflowX: 'hidden', height: '90%' }
        }>
            <ul onClick={(e: React.MouseEvent<HTMLUListElement>) =>
                handleClick(e, props.setId)} className='listDiscussion'>
                {props.listPm && props.listPm.map((chan: listPm) => (
                    <li key={++i} id={chan.chatid}>
                        {chan.user.username}
                    </li>
                ))}
            </ul>
        </Element>

        <span>List channel</span>
        <Element name="container" className="element" style={
            { overflowY: 'scroll', overflowX: 'hidden', height: '90%' }
        }>
            <ul onClick={(e: React.MouseEvent<HTMLUListElement>) =>
                handleClick(e, props.setId)} className='listDiscussion'>
                {props.listChannel && props.listChannel.map((chan: { id: string, name: string }) => (
                    <li key={++i} id={chan.id}>
                        {chan.name}
                    </li>
                ))}
            </ul>
        </Element>
        <button onClick={(e) => handleUpdate(e, props.setChannel,
            props.setPm, props.jwt,
            props.setErrorCode)}
            className='update-channel update-channel2'
        >
            Update
        </button>
        <BoxPmUser setId={props.setId} setErrorCode={props.setErrorCode} setPm={props.setPm} jwt={props.jwt} listPm={props.listPm} />
    </div>
    );
}

type typePostMsg = {
    id: string, msg: string | null,
    usrSocket: Socket<any, any> | undefined, idBox: string, isPrivate: boolean,
    setMsg: React.Dispatch<React.SetStateAction<string | null>>,
    setLstMsgChat: React.Dispatch<React.SetStateAction<lstMsg[]>>,
    setLstMsgPm: React.Dispatch<React.SetStateAction<lstMsg[]>>,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>
}

const PostMsg = (props: typePostMsg) => {
    const refElem = useRef(null);
    const { lstUserGlobal, lstUserChat, setLstMsgChat,
        setLstMsgPm, setLstUserGlobal,
        setLstUserChat, setId } = useContext(ContextDisplayChannel);
    const userCtx: any = useContext(UserContext);
    let jwt = userCtx.getJwt();
    const navigate = useNavigate();
    /* Post msg */
    const handleSubmitButton = (e: React.MouseEvent<HTMLButtonElement>,
        obj: any, ref: any) => {
        if (!e || !e.target)
            return;
        e.preventDefault();
        let cmdIsValid = true;

        if (obj.content
            && obj.isPm === true
            && obj.content === "/leavePm") {
            props.usrSocket?.emit('leaveRoomChatPm', { id: obj.id }, () => {
                setId("");
            });
        }
        else if (obj.content && obj.content === "/help") {
            setLstMsgPm((lstMsg) => [...lstMsg, helper]);
        }
        else if (obj.content && obj.content[0] === '/') {
            cmdIsValid = commandChat(jwt, obj, props.setErrorCode,
                lstUserGlobal, lstUserChat, setLstUserGlobal,
                setLstUserChat, navigate);
            if (cmdIsValid === false) {
                props.usrSocket?.emit('sendMsg', obj, (res: lstMsg) => {
                    if (res && res.room === obj.id && obj.idBox === obj.id)
                        setLstMsgChat((lstMsg) => [...lstMsg, res]);
                    if (res && res.room === obj.id)
                        setLstMsgPm((lstMsg) => [...lstMsg, res]);
                });
            }
        }
        else {
            props.usrSocket?.emit('sendMsg', obj, (res: lstMsg) => {
                if (res && res.room === obj.id && obj.idBox === obj.id)
                    setLstMsgChat((lstMsg) => [...lstMsg, res]);
                if (res && res.room === obj.id)
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
            if (obj.content
                && obj.isPm === true
                && obj.content === "/leavePm") {
                props.usrSocket?.emit('leaveRoomChatPm', { id: obj.id }, () => {
                    setId("");
                });
            }
            else if (obj.content && obj.content === "/help") {
                setLstMsgPm((lstMsg) => [...lstMsg, helper]);
            }
            else if (obj.content && obj.content[0] === '/') {
                cmdIsValid = commandChat(jwt, obj, props.setErrorCode,
                    lstUserGlobal, lstUserChat, setLstUserGlobal,
                    setLstUserChat, navigate);
                if (cmdIsValid === false) {
                    props.usrSocket?.emit('sendMsg', obj, (res: lstMsg) => {
                        if (res && res.room === obj.id && obj.idBox === obj.id)
                            setLstMsgChat((lstMsg) => [...lstMsg, res]);
                        if (res && res.room === obj.id)
                            setLstMsgPm((lstMsg) => [...lstMsg, res]);
                    });
                }
            } else {
                props.usrSocket?.emit('sendMsg', obj, (res: lstMsg) => {
                    if (res && res.room === obj.id && obj.idBox === obj.id)
                        setLstMsgChat((lstMsg) => [...lstMsg, res]);
                    if (res && res.room === obj.id)
                        setLstMsgPm((lstMsg) => [...lstMsg, res]);
                });
            }
            props.setMsg("");
            ref.current.value = "";
        }
    }
    return (
        <>
            {props.id == "" && <div className='containerPost'>Please open a channel or private message<Button /></div>}
            {props.id && props.id != "" &&
                <div className='containerPost'>
                    <textarea ref={refElem} id="submitArea"
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => props.setMsg(e.currentTarget.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                            handleSubmitArea(e,
                                {
                                    id: props.id,
                                    idBox: props.idBox,
                                    content: props.msg,
                                    isPm: props.isPrivate,
                                }, refElem
                            )}
                        className="chatBox" name="msg"></textarea>
                    <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSubmitButton(e,
                        {
                            id: props.id,
                            idBox: props.idBox,
                            content: props.msg,
                            isPm: props.isPrivate,
                        }, refElem)}
                    >Go</button>
                    <Button />
                </div>
            }
        </>
    );
}

/* getSecondPartRegex is url id */
const DiscussionBox = (props: {
    id: string,
    jwt: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    setId: React.Dispatch<React.SetStateAction<string>>
}) => {
    const stringRegex = /(\/\w*\/)/;
    const regex = RegExp(stringRegex, 'g');
    const getLocation = useLocation()?.pathname;
    const getFirstPartRegex = regex.exec(getLocation);
    let getSecondPartRegex = '';

    if (typeof getLocation !== "undefined") {
        getSecondPartRegex = getLocation.replace(stringRegex, "");
    }
    const userCtx: any = useContext(UserContext);
    const { usrSocket } = useContext(SocketContext);
    const [online, setOnline] = useState<undefined | boolean | string>(undefined)
    useEffect(() => {
        //subscribeChat
        if (props.id != "") {
            usrSocket?.emit("joinRoomChat", {
                id: props.id,
            }, (res: any) => {
                if (res && res.ban === true)
                    setOnline("Ban");
                else {
                    if (res === true)
                        setOnline(true);
                    else
                        setOnline(false);
                }
            });
        }
        return (() => {
            //unsubscribeChat
            if (getSecondPartRegex != props.id
                && getFirstPartRegex && getFirstPartRegex[0] == "/channels/") {
                usrSocket?.emit("stopEmit", { id: props.id }, () => {
                    setOnline(false);
                });
            } else if (getSecondPartRegex !== "/channels") {
                usrSocket?.emit("stopEmit", { id: props.id }, () => {
                    setOnline(false);
                });
            }
        })
    }, [props.id, usrSocket]);

    const { lstMsgPm, lstUserGlobal, setLstMsgPm, setLstMsgChat } = useContext(ContextDisplayChannel);
    const [isPrivate, setIsPrivate] = useState<boolean>(false);
    useEffect(() => {
        const ft_lst = async () => {
            const res = await fetch('https://' + location.host + '/api/chat?' + new URLSearchParams({
                id: props.id,
            }),
                { headers: header(props.jwt) })
                .then(res => {
                    if (res && res.ok)
                        return (res.json());
                    if (res)
                        props.setErrorCode(res.status);
                }).catch(e => console.log(e));
            if (typeof res != "undefined" && typeof res.lstMsg != "undefined") {
                if (res.accesstype === "4")
                    setIsPrivate(true);
                else
                    setIsPrivate(false);
                setLstMsgPm(res.lstMsg);
            }
        }
        if (online === true)
            ft_lst();
        usrSocket?.on("actionOnUser2", (res: any) => {
            if ((res.type === "Ban" || res.type === "Kick")
                && userCtx.getUserId() === res.user_id
                && res.room === props.id) {
                props.setId("");
            }
            if (res.room === props.id)
                setLstMsgPm((lstMsg) => [...lstMsg, res]);
        });

        return (() => {
            setIsPrivate(false);
            usrSocket?.off("actionOnUser2");
            setLstMsgPm([]);
        });
    }, [lstMsgPm.keys, props.id, JSON.stringify(lstUserGlobal),
        online, usrSocket]);
    useEffect(() => {
        usrSocket?.on("sendBackMsg2", (res: any) => {
            //need to check if user is blocked
            if (lstUserGlobal && res) {
                let found = lstUserGlobal.find(elem => Number(elem.id) === res.user_id && elem.bl === 1);
                if (!found) {
                    if (res.room === props.id)
                        setLstMsgPm((lstMsg) => [...lstMsg, res]);
                }
            }
        });
        return (() => { usrSocket?.off("sendBackMsg2"); });
    }, [JSON.stringify(lstUserGlobal), props.id]);
    const [msg, setMsg] = useState<null | string>("");

    if (online === "Ban" && props.id != "")
        return (<article className='containerDiscussionBox'><span className='fullBox'>You are banned from this chat</span><Button /></article>)
    else if (props.id != "" && online === false)
        return (<article className='containerDiscussionBox'><span className='fullBox'>Unauthorized connection</span><Button /></article>)
    else if (props.id != "" && typeof online == "undefined")
        return (<article className='containerDiscussionBox'><span className='fullBox'>Connecting to chat...</span><Button /></article>)
    return (<div className='containerDiscussionBox'>
        <ListMsg lstMsg={lstMsgPm} id={props.id} />
        <PostMsg id={props.id} usrSocket={usrSocket} idBox={getSecondPartRegex} msg={msg}
            isPrivate={isPrivate} setMsg={setMsg}
            setErrorCode={props.setErrorCode}
            setLstMsgChat={setLstMsgChat} setLstMsgPm={setLstMsgPm} />
        <LoadUserGlobal jwt={props.jwt} />
    </div>);
}

type updateChannelType = {
    setChannel: React.Dispatch<React.SetStateAction<listChan[]>>,
    setPm: React.Dispatch<React.SetStateAction<listPm[]>>,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>
}

const updateChannel = (setChannel: updateChannelType["setChannel"],
    setPm: updateChannelType["setPm"], jwt: string | null,
    setErrorCode: updateChannelType["setErrorCode"]) => {
    fetch('https://' + location.host + '/api/chat/list-pm',
        { headers: header(jwt) })
        .then(res => {
            if (res && res.ok)
                return (res.json());
            if (res)
                setErrorCode(res.status);
        })
        .then(res => {
            setPm(res);
        }).catch(e => console.log(e));
    /* load all channels */
    fetch('https://' + location.host + '/api/chat/channel-registered',
        { headers: header(jwt) })
        .then(res => {
            if (res && res.ok)
                return (res.json());
            setErrorCode(res.status);
        }).then(res => {
            if (res)
                setChannel(res);
        }).catch(e => console.log(e));
}

const Box = (props: settingBox) => {
    const [lstPm, setPm] = useState<listPm[]>([] as listPm[]);
    const [lstChannel, setChannel] = useState<listChan[]>([] as listChan[]);

    useEffect(() => {
        /* load channels */
        updateChannel(setChannel, setPm,
            props.jwt, props.setErrorCode);
        return (() => {
            setPm([]);
            setChannel([]);
            props.setId("");
        })
    }, [lstPm.keys, lstChannel.keys]);
    return (
        <article className='containerDirectMessage unfold' style={{
            maxWidth: props.width,
            maxHeight: props.height,
            opacity: props.opacity,
        }}>
            <ListDiscussion listPm={lstPm} listChannel={lstChannel} setChannel={setChannel}
                setId={props.setId} setErrorCode={props.setErrorCode} setPm={setPm}
                jwt={props.jwt} />
            <DiscussionBox id={props.id} jwt={props.jwt}
                setErrorCode={props.setErrorCode} setId={props.setId} />
        </article>
    );
}

/*
    Waiting for user displaying Direct Message part
*/
const FoldDirectMessage = (props: settingChat) => {
    return (<article className='containerDirectMessage fold' style={{
        maxWidth: props.width,
        height: props.height,
        opacity: props.opacity,
    }}><Button /><span>Open chat box</span></article>);
}

const UnfoldDirectMessage = (props: settingChat) => {
    const { renderDirectMessage, id, setId } = useContext(ContextDisplayChannel);
    const [errorCode, setErrorCode] = useState<number>(200);

    if (errorCode >= 400)
        return (<FetchError code={errorCode} />);
    if (renderDirectMessage === false || typeof id === "undefined")
        return <FoldDirectMessage
            width={props.width} height={50}
            opacity={0.6} jwt={props.jwt}
        />
    return <Box render={renderDirectMessage} id={id}
        width={props.width} height={props.height}
        opacity={0.9} jwt={props.jwt}
        setErrorCode={setErrorCode} setId={setId}
    />
}

export default UnfoldDirectMessage;