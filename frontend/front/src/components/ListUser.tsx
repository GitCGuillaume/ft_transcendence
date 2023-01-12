import React, { MouseEvent } from 'react';
import "../css/channel.css"
import "../css/chat.css"

type State = {
    userInfoDisplay: boolean,
    userName: string,
    listUser: Array<{
        id: number,
        content: string,
    }>
}

class ListUser extends React.Component<{}, State> {
    constructor(props: any) {
        super(props);
        this.state = {

            userInfoDisplay: false,
            userName: '',
            listUser: [{
                id: 0,
                content: 'abc'
            }, {
                id: 0,
                content: 'def'
            }],
        }
        this.handleClick = this.handleClick.bind(this);
        this.BlockUnblock = this.BlockUnblock.bind(this);
        this.InviteGame = this.InviteGame.bind(this);
        this.UserProfile = this.UserProfile.bind(this);
        this.DirectMessage = this.DirectMessage.bind(this);
    }
    /* Bubble event, for propagating */
    handleClick = (event: MouseEvent<HTMLDivElement>): void => {
        event.preventDefault();
        const e: HTMLElement = event.target as HTMLElement;
        const name: string = e.textContent as string;
        if (name != this.state.userName) {
            this.setState((prevState => (
                {
                    userInfoDisplay: true,
                    userName: name
                }
            )));
        }
        else {
            this.setState({
                userInfoDisplay: false,
                userName: ''
            })
        }
    }
    BlockUnblock = (event: MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
    }
    InviteGame = (event: MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
    }
    UserProfile = (event: MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
    }
    DirectMessage = (event: MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
    }
    UserInfo = (): JSX.Element => {
        const chooseClassName: string = (this.state.userInfoDisplay == true ? "userInfo userInfoClick" : "userInfo");
        let i: number = 0;
        return (<>
            <table className='tableInfo'>
                <thead>
                    <tr>
                        <th>User(s) connected</th>
                    </tr>
                </thead>
                <tbody onClick={this.handleClick}>
                    {this.state.listUser &&
                        this.state.listUser.map((usr) => (
                            <tr key={++i}>
                                <td>{usr.content}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <div className={chooseClassName}>
                <label className="userInfo">{this.state.userName}</label>
                <button onClick={this.BlockUnblock} className="userInfo">Block/Unblock</button>
                <button onClick={this.InviteGame} className="userInfo">Invite to a game</button>
                <button onClick={this.UserProfile} className="userInfo">User Profile</button>
                <button onClick={this.DirectMessage} className="userInfo">Direct message</button>
            </div>
        </>
        )
    }
    render() {
        return (<><this.UserInfo /></>);
    }
}

export default ListUser;