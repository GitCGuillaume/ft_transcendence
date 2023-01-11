import React, { ChangeEvent, FormEvent } from 'react';
import { io, Socket } from 'socket.io-client';
import { Link } from "react-router-dom";
type Props = {
    lstMsg: Array<{
        id: number,
        content: string,
    }>
}

type State = {
    lstMsg: Array<{
        id: number,
        content: string,
    }>,
    msg: string,
    socket: Socket<any, any>
}

class Chat extends React.Component<Props, {}> {
    render() {
        let i = 0;
        return (
            <>
                {this.props.lstMsg &&
                    this.props.lstMsg.map((msg) => (
                        <tr key={++i}>
                            <td>{msg.id}</td>
                            <td>{msg.content}</td>
                        </tr>
                    ))
                }
            </>
        );
    }
}

export default class WebSocketTestGc extends React.Component<{ id: number }, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            lstMsg: [{
                id: this.props.id,
                content: ''
            }],
            msg: '',
            socket: io()
        }
        this.onClick = this.onClick.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }
    componentDidMount(): void {
        this.setState({
            socket: io("http://localhost:4000", {
                auth: {
                    token: "abcd"
                },
            })
        })
        console.log("mounted");
    }
    onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        this.state.socket.emit('joinTestRoom', "msg", (res: any) => {
            console.log(res);
            this.state.socket.on("roomCreated", (res: {}) => {
                console.log("My id is: " + this.state.socket.id);
                console.log(res);
            })
        });
    };
    onChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const value = e.currentTarget.value;
        this.setState({ msg: value });
    }
    onSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        const socket = io("http://localhost:4000");
        socket.emit('events', { msg: this.state.msg }, (res: any) => {
            console.log(res);
            const element = {
                id: 0,
                content: res.msg
            };
            this.setState({
                lstMsg: [...this.state.lstMsg, element]
            });
        });
    }
    render() {
        return (
            <section>
                <article>
                    <nav>
                        <Link to="/">Home</Link>
                    </nav>
                    <button onClick={this.onClick}>Test join websocket room(channel)</button>
                </article>
                <article>
                    <form onSubmit={this.onSubmit}>
                        <input type="text" name="msg"
                            value={this.state.msg} onChange={this.onChange} />
                        <input type="submit" value="Envoyer" />
                    </form>
                    <table>
                        <thead>
                            <tr>
                                <th>id</th><th>Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            <Chat lstMsg={this.state.lstMsg} />
                        </tbody>
                    </table>
                </article>
            </section>
        );
    }
}