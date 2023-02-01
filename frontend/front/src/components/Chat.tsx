import React, { useEffect, useRef, MutableRefObject, useState, useContext } from 'react';
import ListUser from './ListUser';
import "../css/chat.css";
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import img from "../assets/react.svg";
import scroll from 'react-scroll';
//import { io, Socket } from 'socket.io-client';
import { SocketContext } from '../contexts/Socket';

type lstMsg = {
    lstMsg: Array<{
        idUser: string,
        username: string, //à enlever pour un find dans repository
        content: string
    }>
}

/* return user state list */
const ListMsg = (props: any) => {
    const scrollBottom = useRef<any>();
    const Element = scroll.Element;
    let EScroll = scroll.animateScroll;
    let i: number = 0;
    let arrayLength: number = props.lstMsg.length - 5;
    if (arrayLength < 0)
        arrayLength = 0;
    useEffect(() => {
        if (scrollBottom && scrollBottom.current)
            EScroll.scrollToBottom({ containerId: "containerElement", duration: 0 });
    }, [props.lstMsg, props.id, scrollBottom.current])
    return (
        <Element name="container" className="element fullBox" id="containerElement" ref={scrollBottom}>
            {
                props.lstMsg &&
                props.lstMsg.slice(arrayLength, props.lstMsg.length).map((msg: any) => (
                    <React.Fragment key={++i}>
                        <div><img src={img} className="chatBox" />
                            <label className="chatBox">{msg.username}</label>
                        </div>
                        <span className="chatBox">{msg.content}</span>
                    </React.Fragment>
                ))
            }
        </Element>
    )
}

/* Leave chat */
const handleLeave = async (e: React.MouseEvent<HTMLButtonElement>, usrSocket: any, obj: {
    id: string,
    idUser: string,
    username: string,
}, navigate: any) => {
    e.preventDefault();
    console.log(obj);
    usrSocket.emit('leaveRoomChat', obj, (res: any) => {
        console.log("leave chat : " + res);
        navigate("/channels");
    });
}
/* Post msg */
const handleSubmitButton = (e: React.MouseEvent<HTMLButtonElement>,
    usrSocket: any, obj: any, ref: any, setMsg: any) => {
    e.preventDefault();
    usrSocket.emit('sendMsg', obj);
    setMsg("");
    ref.current.value = "";
}
const handleSubmitArea = (e: React.KeyboardEvent<HTMLTextAreaElement>,
    usrSocket: any, obj: any, ref: any, setMsg: any) => {
    if (e.key === "Enter" && e.shiftKey === false) {
        e.preventDefault();
        usrSocket.emit('sendMsg', obj);
        setMsg("");
        ref.current.value = "";
    }
}

/* besoin context utilisateur */

const MainChat = (props: any) => {
    const refElem = useRef(null);
    //const Element = scroll.Element;
    const [online, setOnline] = useState<undefined | boolean>(undefined)
    const usrSocket = useContext(SocketContext);
    useEffect(() => {
        //subscribeChat
        usrSocket.emit("joinRoomChat", {
            id: props.id,
            idUser: window.navigator.userAgent,
            username: window.navigator.userAgent,
            //name: props.getLocation.state.name,
            psw: props.psw
        }, (res: boolean) => {
            if (res === true)
                setOnline(true);
            else
                setOnline(false);
        });
        console.log("mount");
        return (() => {
            //unsubscribeChat
            console.log("unmount");
            usrSocket.emit("stopEmit", { id: props.id /*, name: props.getLocation.state.name*/ }, () => {
                setOnline(false);
            });
        })
    }, [props.id]);
    const [lstMsg, setLstMsg] = useState<lstMsg[]>([] as lstMsg[]);
    const [chatName, setChatName] = useState<string>("");
    useEffect(() => {
        const ft_lst = async () => {
            const res = await fetch('http://' + location.host + '/api/chat/' + props.id).then(res => res.json());
            if (typeof res.lstMsg != "undefined") {
                setLstMsg(res.lstMsg);
                setChatName(res.name);
            }
            console.log("load...");
        }
        ft_lst();
        console.log("liste mount");
        usrSocket.on("sendBackMsg", (res: any) => {
            console.log("msg");
            setLstMsg((lstMsg) => [...lstMsg, res]);
        });
        return (() => {
            console.log("liste unmount");
            usrSocket.off("sendBackMsg");
            setLstMsg([]);
            setChatName("");
        });
    }, [lstMsg.keys, props.id])

    const [msg, setMsg] = useState<null | string>(null);
    const navigate = useNavigate();

    if (online === false)
        return (<article className='containerChat'>Unauthorized connection</article>)
    else if (typeof online == "undefined")
        return (<article className='containerChat'>Connecting to chat...</article>)
    return (<>
        <article className='containerChat'>
            <div className="chatName"><span style={{ flex: 1 }}>{chatName}</span>
                <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleLeave(e,
                    usrSocket, {
                    id: props.id,
                    idUser: window.navigator.userAgent,
                    username: window.navigator.userAgent,
                    /*name: props.getLocation.state.name*/
                }, navigate)}
                    className='chatLeave'>Leave</button>
            </div>
            <ListMsg lstMsg={lstMsg} />
            <div className="sendMsg">
                <textarea ref={refElem} id="submitArea"
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMsg(e.currentTarget.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                        handleSubmitArea(e,
                            usrSocket, {
                            id: props.id,
                            idUser: window.navigator.userAgent,
                            content: msg
                        },
                            refElem,
                            setMsg)}
                    className="chatBox" name="msg"></textarea>
                <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSubmitButton(e,
                    usrSocket, {
                    id: props.id,
                    idUser: window.navigator.userAgent,
                    content: msg
                }, refElem, setMsg)}
                    className="chatBox">Go</button>
            </div>
        </article>
        <article className='right'>
            <ListUser />
        </article>
    </>);
}

const onSubmit = async (e: React.FormEvent<HTMLFormElement>
    , value: string | null, id: string): Promise<boolean> => {
    e.preventDefault();
    return (fetch("http://" + location.host + "/api/chat/valid-paswd/", {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            psw: value
        })
    }).then(res => res.json()));
}

/* Detect and return if a password for the channel is used
    return a promise 
*/
const hasPassword = (id: Readonly<string>): Promise<boolean> => {
    return (fetch('http://' + location.host + '/api/chat/has-paswd/' + id)
        .then(res => res.json()));
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
        return (() => {
            setValid(false);
            setValue(null);
            setError(false);
        });
    }, [props.id]);
    if (props.hasPsw === true && valid == false) {
        return (<article className='containerChat'>
            <p>This channel require a password</p>
            <form onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
                setValid(await onSubmit(e, value, props.id));
                valid === false ? setError(true) : setError(false);
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
    return (<MainChat id={props.id} getLocation={props.getLocation} psw={value} />);
}

const BlockChat = (props: any) => {
    if (props.hasPsw !== undefined) {
        if (props.hasPsw == false)
            return (<MainChat id={props.id} getLocation={props.getLocation} psw="" />);
        else
            return (<PasswordBox id={props.id} hasPsw={props.hasPsw}
                getLocation={props.getLocation} />);
    }
    return (<></>);
}

const Chat = () => {
    const getLocation = useLocation();
    const [psw, setLoadPsw] = useState<boolean | undefined>(undefined);
    const id = useParams().id as string;
    const hasPass: Promise<boolean> = hasPassword(id);

    hasPass.then(res => {
        setLoadPsw(res);
    })
    return (<BlockChat id={id} getLocation={getLocation}
        hasPsw={psw} />);
}


export default Chat;