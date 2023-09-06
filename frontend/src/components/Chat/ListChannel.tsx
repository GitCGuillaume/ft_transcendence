import React, { ChangeEvent, FormEvent, useState } from 'react';
import { Link, Outlet, useNavigate } from "react-router-dom";
import "../../css/channel.css";
import { ContextUserLeave } from '../../contexts/LeaveChannel';
import { FetchError, header, headerPost } from '../FetchError';

type State = {
    listChannel: Array<{
        channel_id: number | string,
        channel_name: string,
        User_username: string,
        channel_accesstype: number,
    }>,
    listChannelPrivate: Array<{
        channel_id: number | string,
        channel_name: string,
        User_username: string,
        channel_accesstype: number,
    }>,
    channelName: string,
    privateChannelName: string,
    rad: string,
    password: string,
    passwordPrivate: string,
    hasError: boolean,
    listError: [],
    privateIdChannel: string,
    errorCode: number
}

type Props = {
    access: number,
}

const ErrorSubmit = (props: any) => {
    let i: number = 0;
    return (<div style={{ "width": "100%" }}>
        {props.listError &&
            props.listError.map((err: string) => (
                <p style={{ color: "red" }} key={++i}>{err}</p>
            ))
        }
    </div>);
}

const onSubmitJoin = async (e: FormEvent<HTMLFormElement>, setErr: React.Dispatch<React.SetStateAction<boolean>>,
    name: string | null, navigate: any, jwt: string | null) => {
    e.preventDefault();

    if (name) {
        navigate("/channels");
        await fetch('https://' + location.host + '/api/chat?' + new URLSearchParams({
            id: name,
        }),
            { headers: header(jwt) })
            .then(res => {
                if (res && res.ok)
                    return (res.json());
            })
            .then(res => {
                if (Object.keys(res).length !== 0) {
                    setErr(false);
                    navigate({ pathname: "/channels/" + name },
                        { state: { name: name, username: "" } });
                }
                else
                    setErr(true);
            })
            .catch(e => console.log(e));
    }
}

const OpenPrivateChat = (props: { jwt: string }) => {
    const navigate = useNavigate();
    const [name, setName] = useState<string | null>(null);
    const [err, setErr] = useState<boolean>(false);
    return (<>
        <form className="channel"
            onSubmit={(e: FormEvent<HTMLFormElement>) =>
                onSubmitJoin(e, setErr, name, navigate, props.jwt)}>
            <label>Enter a channel ID to join a channel
                <input type="text"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setName(e.currentTarget.value)}
                    placeholder='Enter channel name'
                    name="privateChannelName"
                />
            </label>
            <input type="submit" value="Join channel" />
        </form>
        {err === true && <p className="channel">No channel found with this identifier.</p>}
    </>);
}

class ListChannel extends React.Component<{ jwt: string | null }, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            listChannel: [],
            listChannelPrivate: [],
            channelName: '',
            privateChannelName: '',
            rad: '0',
            password: '',
            passwordPrivate: '',
            hasError: false,
            listError: [],
            privateIdChannel: '',
            errorCode: 200
        }
        this.onClick = this.onClick.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }
    componentDidMount = (): void => {
        fetch('https://' + location.host + '/api/chat/public/',
            { headers: header(this.props.jwt) })
            .then(res => {
                if (res && res.ok)
                    return (res.json());
                if (res) {
                    this.setState({
                        errorCode: res.status
                    });
                }
            }).then(res => {
                if (res) {
                    this.setState({
                        listChannel: res
                    });
                }
            }).catch(e => console.log(e));
        fetch('https://' + location.host + '/api/chat/private',
            { headers: header(this.props.jwt) }).then(res => {
                if (res && res.ok)
                    return (res.json());
                if (res) {
                    this.setState({
                        errorCode: res.status
                    });
                }
            }).then(res => {
                if (res) {
                    this.setState({
                        listChannelPrivate: res
                    });
                }
            }).catch(e => console.log(e));
    }

    componentWillUnmount(): void {
        this.setState({
            listChannel: [],
            listChannelPrivate: []
        })
    }
    onClick = (): void => {
        fetch('https://' + location.host + '/api/chat/public/',
            { headers: header(this.props.jwt) })
            .then(res => {
                if (res && res.ok)
                    return (res.json());
            }).then(res => {
                if (res) {
                    this.setState({
                        listChannel: res
                    });
                }
            }).catch(e => console.log(e))
        fetch('https://' + location.host + '/api/chat/private',
            { headers: header(this.props.jwt) }).then(res => {
                if (res && res.ok)
                    return (res.json());
                if (res) {
                    this.setState({
                        errorCode: res.status
                    });
                }
            }).then(res => {
                if (res) {
                    this.setState({
                        listChannelPrivate: res
                    });
                }
            }).catch(e => console.log(e))
    }
    onChange = (e: ChangeEvent<HTMLInputElement>): void => {
        e.stopPropagation();
        const name = e.currentTarget.name;
        const value = e.currentTarget.value;
        this.setState((prevState => (
            { ...prevState, [name]: value }
        )));
    };

    onSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        if (this.state.rad == "0") {
            fetch('https://' + location.host + '/api/chat/new-public/', {
                method: 'post',
                headers: headerPost(this.props.jwt),
                body: JSON.stringify({
                    id: '0', //keeping this for backend part
                    name: this.state.channelName,
                    accesstype: this.state.rad,
                    password: this.state.password,
                    lstMsg: [],
                    lstUsr: {},
                    lstMute: {},
                    lstBan: {}
                })
            }).then(res => {
                if (res && res.ok)
                    return (res.json());
                if (res) {
                    this.setState({
                        errorCode: res.status
                    });
                }
            }).then(res => {
                if (res) {
                    if (Array.isArray(res) === true) {
                        this.setState({ hasError: true, listError: res });
                    }
                    else {
                        this.setState({
                            hasError: false, listError: [],
                            listChannel: [...this.state.listChannel, res],
                        });
                    }
                }
            }).catch(e => console.log(e));
        }
        else {
            fetch('https://' + location.host + '/api/chat/new-private/', {
                method: 'post',
                headers: headerPost(this.props.jwt),
                body: JSON.stringify({
                    id: '0', //keeping this for backend part
                    name: this.state.channelName,
                    accesstype: this.state.rad,
                    password: this.state.password,
                    lstMsg: [],
                    lstUsr: {},
                    lstMute: {},
                    lstBan: {}
                })
            }).then(res => {
                if (res && res.ok)
                    return (res.json());
                if (res) {
                    this.setState({
                        errorCode: res.status
                    });
                }
            }).then(res => {
                if (res) {
                    if (Array.isArray(res) === true) {
                        this.setState({ hasError: true, listError: res });
                    }
                    else {
                        this.setState({
                            hasError: false, listError: [],
                            listChannelPrivate: [...this.state.listChannelPrivate, res],
                            privateIdChannel: res.channel_id
                        });
                    }
                }
            }).catch(e => console.log(e));
        }
    }

    PrintListPublic = (): JSX.Element => {
        let i: number = 0;
        const TypeAccess = (props: Props): JSX.Element => {
            const access: Readonly<number> = props.access;
            if (access == 0)
                return (<>Public</>);
            return (<>Password required</>);
        };

        return (<tbody>
            {this.state.listChannel &&
                this.state.listChannel.map((chan) => (
                    <tr key={++i}>
                        <td><Link to={{ pathname: "/channels/" + chan.channel_id }}
                            state={{ name: chan.channel_name, username: "" }}>{chan.channel_name}</Link>
                        </td>
                        <td>{chan.User_username}</td>
                        <td><TypeAccess access={chan.channel_accesstype} /></td>
                    </tr>
                ))
            }
        </tbody>)
    }
    PrintListPrivate = (): JSX.Element => {
        let i: number = 0;
        const TypeAccess = (props: Props): JSX.Element => {
            const access: Readonly<number> = props.access;
            if (access == 2)
                return (<>Private</>)
            return (<>Password required</>);
        };
        return (<tbody>
            {this.state.listChannelPrivate &&
                this.state.listChannelPrivate.map((chan) => (
                    <tr key={++i}>
                        <td><Link to={{ pathname: "/channels/" + chan.channel_id }}
                            state={{ name: chan.channel_name, username: "" }}>{chan.channel_name}</Link>
                        </td>
                        <td>{chan.User_username}</td>
                        <td><TypeAccess access={chan.channel_accesstype} /></td>
                    </tr>
                ))
            }
        </tbody>)
    }

    render(): JSX.Element {
        if (this.state.errorCode >= 400)
            return (<FetchError code={this.state.errorCode} />)
        return (
            <section className='containerChannel'>
                <h1>List channels</h1>
                <article className='left'>
                    <table className='left'>
                        <thead>
                            <tr>
                                <th className='f-case'>Public Channel name</th>
                                <th className='s-case'>Owner</th>
                                <th className='s-case'>Access type</th>
                            </tr>
                        </thead>
                        <this.PrintListPublic />
                    </table>
                    <table className='right'>
                        <thead>
                            <tr>
                                <th className='f-case'>Private Channel name</th>
                                <th className='s-case'>Owner</th>
                                <th className='s-case'>Access type</th>
                            </tr>
                        </thead>
                        <this.PrintListPrivate />
                    </table>
                    <button className='update-channel' onClick={this.onClick}>Update</button>
                </article>
                <article className='bottom'>
                    <form onSubmit={this.onSubmit} className="channel">
                        <label>Create private or public channel</label>
                        <input type="text" onChange={this.onChange}
                            placeholder='Enter channel name' name="channelName" />
                        <label><input type="radio"
                            onChange={this.onChange} name="rad" value="0"
                            checked={this.state.rad === "0"} />Public</label>
                        <label><input type="radio"
                            onChange={this.onChange} name="rad" value="2"
                            checked={this.state.rad === "2"} />Private</label>
                        <input type="password" onChange={this.onChange}
                            placeholder='Password' name="password" />
                        <input type="submit" onChange={this.onChange} value="Add Channel" />
                    </form>
                    {this.props.jwt && <OpenPrivateChat jwt={this.props.jwt} />}
                    {this.state.privateIdChannel && <div className='channel-id'><label>New private channel ID : </label>
                        <span style={{ color: "#FA6405" }}>
                            {this.state.privateIdChannel}
                        </span>
                    </div>}
                    <ErrorSubmit hasError={this.state.hasError} listError={this.state.listError} />
                </article>
                <ContextUserLeave.Provider value={this.onClick}>
                    <Outlet />
                </ContextUserLeave.Provider>
            </section>);
    }
}

export default ListChannel;
