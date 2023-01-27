import React, { useEffect, useRef, MutableRefObject, useState, useContext } from 'react';
import ListUser from './ListUser';
import "../css/chat.css";
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import img from "../assets/react.svg";
import scroll from 'react-scroll';
//import { io, Socket } from 'socket.io-client';
import {SocketContext} from '../contexts/Socket';

type lstMsg = {
    lstMsg: Array<{
        idUser: string,
        username: string, //à enlever pour un find dans repository
        content: string
    }>
}
type lstUsr = {
    lstUsr: Array<{
        id: number | string,
        username: string,
    }>;
}

/* return user state list */
const ListMsg = (props: any) => {
    const Element = scroll.Element;
    let i: number = 0;
    return (
        <Element name="container" className="element fullBox" id="containerElement">
            {props.lstMsg &&
            props.lstMsg.map((msg: any) => (
                <React.Fragment key={++i}><div><img src={img} className="chatBox" /><label className="chatBox">{msg.username}</label></div>
                <span className="chatBox">{msg.content}</span></React.Fragment>
            ))
        }
        </Element>
    )
}

/* test socket */
const onClick = (e: React.MouseEvent<HTMLButtonElement>, usrSocket: any) => {
    e.preventDefault();
    usrSocket.emit('events', "msgSend");
};
/* Leave chat */
const handleLeave = async (e: React.MouseEvent<HTMLButtonElement>, usrSocket: any, obj: {id: string,
    idUser: string,
    username: string,
    name: string}, navigate: any) => {
    e.preventDefault();
    console.log(obj);
    usrSocket.emit('leaveRoomChat', obj, (res:any) => {
        console.log("leave chat : " + res);
        navigate("/channels");
    });
}
/* Post msg */
const handleSubmitButton = (e: React.MouseEvent<HTMLButtonElement>,
    usrSocket: any, obj: any, ref: any, setMsg: any) =>
{
    e.preventDefault();
    usrSocket.emit('sendMsg', obj);
    setMsg("");
    ref.current.value = "";
}
const handleSubmitArea = (e: React.KeyboardEvent<HTMLTextAreaElement>,
    usrSocket: any, obj: any, ref: any, setMsg: any) =>
{
    if (e.key === "Enter" && e.shiftKey === false)
    {
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
    useEffect(() => {
        props.msgEnd?.current?.scrollIntoView({ behavior: "smooth" })
    });
    const [online, setOnline] = useState<boolean>(false);
    /* temporaire pour le test en attendant user */
    const usrSocket = useContext(SocketContext);
    useEffect(() => {
        //subscribeChat
        usrSocket.emit("joinRoomChat", {id: props.id,
            idUser: window.navigator.userAgent,
            username: window.navigator.userAgent,
            name: props.getLocation.state.name
        }, (res: string) => {
            setOnline(true);
            console.log(res);
        });
        usrSocket.on("joinRoomChat", (res: any) => {
            console.log("allo: " + res);
        });
        
        console.log("mount");
        return (() => {
            //unsubscribeChat
            console.log("unmount");
            usrSocket.off("joinRoomChat");
            usrSocket.emit("stopEmit", {id: props.id, name: props.getLocation.state.name}, () => {
                setOnline(false);
            });
        })
    }, [props.id]);
    const [lstMsg, setLstMsg] = useState<lstMsg[]>([] as lstMsg[]);
    useEffect(() => {
        const ft_lst = async () => { 
            const res = await fetch('http://' + location.host + '/api/chat/' + props.id).then(res => res.json());
            setLstMsg(res.lstMsg);
        }
        ft_lst();
        usrSocket.on("sendBackMsg", (res: any) => {
            setLstMsg((lstMsg) => [...lstMsg, res]);
        });
        return (() => {
            usrSocket.off("sendBackMsg");
            setLstMsg([]);
        });
    }, [lstMsg.keys, props.id])
    const [msg, setMsg] = useState<null | string>(null);
    const navigate = useNavigate();
    return (<>
    <p style={{color: "pink"}}>{msg}</p>
        <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => onClick(e, usrSocket)}>Test join websocket room(channel)</button>
        <article className='containerChat'>
            <div className="chatName"><span style={{ flex: 1 }}>{props.getLocation.state.name}</span>
            <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleLeave(e,
                usrSocket, {
                    id: props.id,
                    idUser: window.navigator.userAgent,
                    username: window.navigator.userAgent,
                    name: props.getLocation.state.name
                }, navigate)}
                className='chatLeave'>Leave</button>
            </div>
            <ListMsg lstMsg={lstMsg}/>
            <div className="sendMsg">
                <textarea ref={refElem} id="submitArea"
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMsg(e.currentTarget.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => 
                    handleSubmitArea(e,
                        usrSocket, {id: props.id,
                        idUser: window.navigator.userAgent,
                        content: msg},
                        refElem,
                        setMsg)}
                    className="chatBox" name="msg"></textarea>
                <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSubmitButton(e,
                    usrSocket, {id: props.id,
                    idUser: window.navigator.userAgent,
                    content: msg}, refElem, setMsg)}
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

/* Ne doit pas pouvoir discuter sur le chat même en modifiant pass is valid à true
    besoin backend */
const PasswordBox = (props: Readonly<any>): JSX.Element => {
    const [valid, setValid] = useState(false);
    const [value, setValue] = useState<string | null>(null);

    if (props.psw === true && valid == false) {
        return (<article className='containerChat'>
            <p>This channel require a password</p>
            <form onSubmit={async (e: React.FormEvent<HTMLFormElement>) =>
                setValid(await onSubmit(e, value, props.id))}>
                <label>Password * :</label>
                <input type="password" name="psw"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setValue(e.currentTarget.value)} />
                <input type="submit" />
            </form>
        </article>);
    }
    return (<MainChat id={props.id} msgEnd={props.msgEnd} getLocation={props.getLocation} />);
}

const BlockChat = (props: any) => {
    if (props.psw !== undefined) {
        if (props.psw == false)
            return (<MainChat id={props.id} msgEnd={props.msgEnd} getLocation={props.getLocation} />);
        else
            return (<PasswordBox id={props.id} psw={props.psw}
                msgEnd={props.msgEnd} getLocation={props.getLocation} />);
    }
    return (<></>);
}

const Chat = () => {

    const getLocation = useLocation();
    const msgEnd = useRef<null | HTMLSpanElement>() as MutableRefObject<HTMLSpanElement>;
    const [psw, setLoadPsw] = useState<boolean | undefined>(undefined);

    const id = useParams().id as string;
    const hasPass: Promise<boolean> = hasPassword(id);
    hasPass.then(res => {
        setLoadPsw(res);
    })
    return (<BlockChat id={id} msgEnd={msgEnd} getLocation={getLocation}
        psw={psw} />);
}


export default Chat;
