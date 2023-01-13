import React from 'react';
import ListUser from './ListUser';
import "../css/chat.css";
import {useParams, useLocation} from 'react-router-dom';
import img from "../assets/react.svg";
import transcendencelogo from "../assets/transcendence.png";

type State = {
    name: string
}

interface locState {
    name: string
}

const Chat = () => {
    const location = useLocation();
    const params = useParams();

    return (
        <>
            <article className='containerChat'>
                <div className="chatName">{location.state.name}</div>
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
		<div className="sendMsg"><textarea className="chatBox" name="msg"></textarea><button className="chatBox">Go</button></div>
		</article>
            <article className='right'>
                <ListUser />
            </article>
        </>
    )
}


export default Chat;
