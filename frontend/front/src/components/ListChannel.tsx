import React, {ChangeEvent, FormEvent, MouseEvent} from 'react';
import { Link, Outlet } from "react-router-dom";
import "../css/channel.css"

type State = {
    listChannel: Array<{
        id: number | string,
        name: string,
        owner: string,
        accessType: number,
    }>,
	channelName: string,
	rad: string,
	password: string
}

type Props = {
    access: number,
}

class ListChannel extends React.Component<{}, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            listChannel: [],
            channelName: '',
            rad: '0',
            password: ''
        }
        this.onClick = this.onClick.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }
    componentDidMount = (): void => {
        fetch('http://localhost:4000/api/chat/list/')
            .then(res => res.json())
            .then(res => {
                this.setState({
                    listChannel: res
                })
            })
    }
    onClick = (e: MouseEvent<HTMLButtonElement>): void => {
        fetch('http://localhost:4000/api/chat/list/')
            .then(res => res.json())
            .then(res => {
                this.setState({
                    listChannel: res
                })
            })
    }
    onChange = (e: ChangeEvent<HTMLInputElement>): void => {
		const name = e.currentTarget.name;
		const value = e.currentTarget.value;
		this.setState((prevState => (
			{ ...prevState, [name]: value }
		)));
	};
	onSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (this.state.rad == "0")
        {
            const res:any = fetch('http://localhost:4000/api/chat/new-public/', {
                method: 'post',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    id: 0,
                    name: this.state.channelName,
                    owner: 0,
                    accessType: this.state.rad,
                    password: this.state.password,
                })
            }).then(res => res.json()).then(res => {
                this.setState({
                    listChannel: res
                })
            });
        }
        else
        {
            const res:any = fetch('http://localhost:4000/api/chat/new-private/', {
                method: 'post',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    id: '',
                    name: this.state.channelName,
                    owner: 0,
                    accessType: this.state.rad,
                    password: this.state.password,
                })
            }).then(res => res.json()).then(res => {
                this.setState({
                    listChannel: [...this.state.listChannel, res]
                });
            });
        }
	}
	PrintList = (): JSX.Element => {
        let i: number = 0;
        const TypeAccess = (props: Props): JSX.Element => {
            const access: number = props.access;
            if (access == 0)
                return (<>Public</>)
            else
                return (<>Password required</>)
            return (<div></div>)
        };

        return (<tbody>
            {this.state.listChannel &&
                this.state.listChannel.map((chan) => (
                    <tr key={++i}>
                        <td><Link to={{ pathname: "/channels/" + chan.id }}  state={{ name: chan.name }}>{chan.name}</Link></td><td>{chan.owner}</td><td><TypeAccess access={chan.accessType} /></td>
                    </tr>
                ))
            }
        </tbody>)
    }
    render(): JSX.Element {
        return (<section className='container'>
            <h1>List channels + (affichage liste privée à faire + persist dtb)</h1>
            <article className='left'>
                <table>
                    <thead>
                        <tr>
                            <th>Channel name</th><th>Owner</th><th>Access type</th>
                        </tr>
                    </thead>
                    <this.PrintList />
                </table>
            </article>
            <article className='bottom'>
                <button onClick={this.onClick}>Update</button>
                <form onSubmit={this.onSubmit}>
                    <input type="text" onChange={this.onChange} placeholder='Enter channel name' name="channelName" />
                    <input type="radio" onChange={this.onChange} name="rad" value="0"/><label>Public</label>
                    <input type="radio" onChange={this.onChange} name="rad" value="1" /><label>Private</label>
                    <input type="text" onChange={this.onChange} placeholder='Password' name="password" />
                    <input type="submit" onChange={this.onChange} value="Add Channel" />
                </form>   
	        </article>
            <Outlet />
        </section>);
    }
}

export default ListChannel;
