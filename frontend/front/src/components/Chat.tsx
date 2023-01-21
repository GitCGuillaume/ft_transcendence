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
type lstUsr= {
	lstUsr: Array<{
        	id: number | string,
        	username: string,
    	}>;
}
const useListMsg = (idChat: string) => {
    const [msg, setMsg] = useState<null | lstMsg[]>([] as lstMsg[]);
    //use effect getter
    return (msg);
}

const useListUser = () => {
	const [usr, setUsr] = useState<null | lstUsr[]>([] as lstUsr[]);
	const getUsers = async () => {
    }
	return (usr);
}

const	useConnect = (idChat: string, name: string) => {
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

const onClick = (e: React.MouseEvent<HTMLButtonElement>, usrSocket: any) => {
	e.preventDefault();
	usrSocket.emit('joinTestRoom', "msg", (res: any) => {
        console.log(res);
        usrSocket.on("roomCreated", (res: {}) => {
			console.log(res);
		})
	});
};

const Chat = () => {
    const Element = scroll.Element;
    const getLocation = useLocation();
    const msgEnd = useRef<null | HTMLSpanElement>() as MutableRefObject<HTMLSpanElement>;
    console.log(getLocation);
    const id = useParams().id as string;

    useEffect(() => {
        msgEnd?.current?.scrollIntoView({ behavior: "smooth" })
    });
    //Error component gogo
    //if (getLocation.state == null)
    //    return (<></>);
	let [usrId, username, usrSocket] = useConnect(id, getLocation.state.username);
    return (
        <>
            <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => onClick(e, usrSocket)}>Test join websocket room(channel)</button>
            <article className='containerChat'>
                <div className="chatName"><span style={{ flex: 1 }}>{getLocation.state.name}</span><button className='chatLeave'>Leave</button></div>
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
                    <span ref={msgEnd} className="chatBox">Contentqsdqdqsqshjsqhkjhdd</span>
                </Element>
                <div className="sendMsg"><textarea className="chatBox" name="msg"></textarea><button className="chatBox">Go</button></div>
            </article>
            <article className='right'>
                <ListUser />
            </article>
        </>
    )
}


export default Chat;
