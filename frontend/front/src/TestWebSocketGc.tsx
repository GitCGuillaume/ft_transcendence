import React, {ChangeEvent, FormEvent} from 'react';
import { Routes, Route, Link, Outlet } from "react-router-dom";
import { io } from 'socket.io-client';

type Props = {
}

type State = {
    msg: string
}

export default class WebSocketTestGc extends React.Component<Props, State> {
    constructor(props: any) {
		super(props);
        this.state = {
            msg: ''
        }
        this.onClick = this.onClick.bind(this);
    }
    
    onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const socket = io("http://localhost:8080");
        socket.emit('events', {name: 'Nest'}, (res: any) => {
            console.log(res);
        });
    };

    TestButton = () => {
        return (
            <>
                <button onClick={this.onClick}>Send socket.io msg to Websocket</button>
            </>
        );
    };

    Root = ():JSX.Element => {
        return (<>
            <nav>
            <ul>
            <li>
                <Link to="/">Root link</Link>
            </li>
            <li>
                <Link to="/ws">WS test link</Link>
            </li>
            </ul>
        </nav>
        <Outlet />
        </>
        );
    };

    render() {
        return (
            <Routes>
                <Route path="/" element={<this.Root/>}>
                    <Route path="/ws" element={<this.TestButton/>} />
                </Route>
            </Routes>
        );
    }
}