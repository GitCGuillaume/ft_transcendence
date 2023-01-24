import React, { useEffect, useRef, MutableRefObject, useState } from 'react';
import ListUser from './ListUser';
import "../css/chat.css";
import { useLocation, useParams } from 'react-router-dom';
import img from "../assets/react.svg";
import scroll from 'react-scroll';
import { io, Socket } from 'socket.io-client';

type lstMsg = {
    lstMsg: Array<{
        avatarUrl: string,
        id: number | string,
        username: string,
        content: string
    }>
}
type lstUsr = {
    lstUsr: Array<{
        id: number | string,
        username: string,
    }>;
}
/* return msg list state */
const useListMsg = (idChat: Readonly<string>) => {
    const [msg, setMsg] = useState<null | lstMsg[]>([] as lstMsg[]);
    //use effect getter
    return (msg);
}
/* return user state list */
const useListUser = () => {
    const [usr, setUsr] = useState<null | lstUsr[]>([] as lstUsr[]);
    const getUsers = async () => {
    }
    return (usr);
}
/* Set socket client */
const useConnect = (idChat: Readonly<string>, name: Readonly<string>) => {
    const [usrId, setUsrId] = useState<string | null>(null);
    const [username, setUsrName] = useState<string | null>(null);
    const [usrSocket, setSocket] = useState<Socket>(io("http://" + location.host));

    useEffect(() => {
        setUsrId(idChat);
        setUsrName(name);
    });
    useEffect(() => {
        setUsrId(idChat);
        setUsrName(name);
    }, [usrId, username]);
    return ([usrId, username, usrSocket]);
}
/* test socket */
const onClick = (e: React.MouseEvent<HTMLButtonElement>, usrSocket: any) => {
    e.preventDefault();
    usrSocket.emit('joinTestRoom', "msg", (res: any) => {
        console.log(res);
        usrSocket.on("roomCreated", (res: {}) => {
            console.log(res);
        })
    });
};

/* besoin session utilisateur */

const MainChat = (props: any) => {
    const Element = scroll.Element;
    let [usrId, username, usrSocket] = useConnect(props.id, props.getLocation.state.username);

    useEffect(() => {
        props.msgEnd?.current?.scrollIntoView({ behavior: "smooth" })
    });
    return (<>
        <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => onClick(e, usrSocket)}>Test join websocket room(channel)</button>
        <article className='containerChat'>
            <div className="chatName"><span style={{ flex: 1 }}>{props.getLocation.state.name}</span><button className='chatLeave'>Leave</button></div>
            <Element name="container" className="element fullBox" id="containerElement">
                <div><img src={img} className="chatBox" /><label className="chatBox">userNameuuuuuuuuuuuuuuuuuuuuuuuu </label></div>
                <span className="chatBox">Contentqsdqdqsqshjsqhkjhdd</span>
                <div>
                    <img src={img} className="chatBox" /><label className="chatBox">userNameuuuuuuuuuuuuuuuuuuuuuuuu </label>
                </div><span className="chatBox">Contentqsdqdqsqsfkljfklsjqflklklkdskjdfkqdsjkdsjdskjsjdsklfjsdlkfjqjsdqlkfjdslkfjsdlkfjsdlfkjsdflksjlkqfjslkdjfsmfjsdlkfjsdlfjsdfksjldjfjklqsdlkjqdlkqsdjlkdqsjqlkdjqskdjqkdjqklsdjjqsdhqsjdhqjkdshhqsjksjqsjdqsdhqshqsdhsdhqksdhqshjsqhkjhdd</span>
                <div>
                    <img src={img} className="chatBox" /><label className="chatBox">userNameuuuuuuuuuuuuuuuuuuuuuuuu </label>
                </div>
                <span className="chatBox">Contentqsdqdqsqsfkljfklsjqflklklkdskjdfkqdsjkdsjdskjsjdsklfjsdlkfjqjsdqlkfjdslkfjsdlkfjsdlfkjsdflksjlkqfjslkdjfsmfjsdlkfjsdlfjsdfksjldjfjklqsdlkjqdlkqsdjlkdqsjqlkdjqskdjqkdjqklsdjjqsdhqsjdhqjkdshhqsjksjqsjdqsdhqshqsdhsdhqksdhqshjsqhkjhdd</span>
                <div>
                    <img src={img} className="chatBox" /><label className="chatBox">userNameuuuuuuuuuuuuuuuuuuuuuuuu </label>
                </div>
                <span className="chatBox">Contentqsdqdqsqsfkljfklsjqflklklkdskjdfkqdsjkdsjdskjsjdsklfjsdlkfjqjsdqlkfjdslkfjsdlkfjsdlfkjsdflksjlkqfjslkdjfsmfjsdlkfjsdlfjsdfksjldjfjklqsdlkjqdlkqsdjlkdqsjqlkdjqskdjqkdjqklsdjjqsdhqsjdhqjkdshhqsjksjqsjdqsdhqshqsdhsdhqksdhqshjsqhkjhdd</span>
                <div><img src={img} className="chatBox" /><label className="chatBox">userNameuuuuuuuuuuuuuuuuuuuuuuuu </label></div>
                <span className="chatBox">Contentqsdqdqsqshjsqhkjhdd</span>
                <div><img src={img} className="chatBox" /><label className="chatBox">userNameuuuuuuuuuuuuuuuuuuuuuuuu </label></div>
                <span className="chatBox">Contentqsdqdqsqshjsqhkjhdd</span>
                <div><img src={img} className="chatBox" /><label className="chatBox">userNameuuuuuuuuuuuuuuuuuuuuuuuu </label></div>
                <span className="chatBox">Contentqsdqdqsqshjsqhkjhdd</span>
                <div><img src={img} className="chatBox" /><label className="chatBox">userNameuuuuuuuuuuuuuuuuuuuuuuuu </label></div>
                <span className="chatBox">Contentqsdqdqsqshjsqhkjhdd</span>
                <div><img src={img} className="chatBox" /><label className="chatBox">userNameuuuuuuuuuuuuuuuuuuuuuuuu </label></div>
                <span className="chatBox">Contentqsdqdqsqshjsqhkjhdd</span>
                <div><img src={img} className="chatBox" /><label className="chatBox">userNameuuuuuuuuuuuuuuuuuuuuuuuu </label></div>
                <span ref={props.msgEnd} className="chatBox">Contentqsdqdqsqshjsqhkjhdd</span>
            </Element>
            <div className="sendMsg"><textarea className="chatBox" name="msg"></textarea><button className="chatBox">Go</button></div>
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
