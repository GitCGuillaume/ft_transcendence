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

/* test socket */
const onClick = (e: React.MouseEvent<HTMLButtonElement>, usrSocket: any) => {
    e.preventDefault();
    usrSocket.emit('events', "msgSend");
};

const handleLeave = async (e: React.MouseEvent<HTMLButtonElement>, usrSocket: any, obj: any, navigate: any) => {
    e.preventDefault();
    
    usrSocket.emit('leaveRoomChat', obj, (res:any) => {
        console.log("leave chat : " + res);
        navigate("/channels");
    });
}

/* besoin context utilisateur */

const MainChat = (props: any) => {
    const Element = scroll.Element;
    const [msgs, setMsg] = useState<null | string>(null);
    useEffect(() => {
        props.msgEnd?.current?.scrollIntoView({ behavior: "smooth" })
    });
        /* temporaire pour le test en attendant user */
   // const [username, setUsername] = useState<null | string>("name");
   // const [id, setId] = useState<number>(1);
    const usrSocket = useContext(SocketContext);
    useEffect(() => {
        //subscribeChat
        //usrSocket("joinRoomChat", res)
        usrSocket.emit('events', "msgSend");
        usrSocket.on("events", (res: any) => {
            console.log("allo: " + res);
        });
        usrSocket.emit("joinRoomChat", {id: props.id,
            idUser: window.navigator.userAgent,
            username: window.navigator.userAgent,
            name: props.getLocation.state.name
        }, (res: string) => {
            console.log(res);
        });
        usrSocket.on("joinRoomChat", (res: any) => {
            console.log("allo: " + res);
        });
        console.log("mount");
        return (() => {
            //unsubscribeChat
            console.log("unmount");
            //usrSocket.off("events");
            usrSocket.off("events");
            usrSocket.off("joinRoomChat");
            //usrSocket.;
        })
    }, [props.id]);
    const navigate = useNavigate();
    return (<>
    <p style={{color: "pink"}}>{msgs}</p>
        <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => onClick(e, usrSocket)}>Test join websocket room(channel)</button>
        <article className='containerChat'>
            <div className="chatName"><span style={{ flex: 1 }}>{props.getLocation.state.name}</span><button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleLeave(e, usrSocket, {id: props.id, idUser: window.navigator.userAgent}, navigate)} className='chatLeave'>Leave</button></div>
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
