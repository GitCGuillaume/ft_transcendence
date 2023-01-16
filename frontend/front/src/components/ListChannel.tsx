import React from 'react';
import { Link, Outlet } from "react-router-dom";
import "../css/channel.css"

type State = {
    listChannel: Array<{
        id: number,
        name: string,
        owner: string,
        access: number,
    }>,
	channelName: string,
	rad: number,
	password: string
}

type Props = {
    access: number,
}

class ListChannel extends React.Component<{}, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            listChannel: [{
                id: 0,
                name: 'channel name 1',
                owner: 'userName1',
                access: 0,
            }, {
                id: 1,
                name: 'channel name 2',
                owner: 'userName2',
                access: 1,
            }, {
                id: 2,
                name: 'channel name 3',
                owner: 'userName3',
                access: 2,
            }],
		channelName: '',
		rad: 'public',
		password: ''
        }
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }
    	onChange = (e: ChangeEvent<HTMLInputElement>): void => {
		const name = e.currentTarget.name;// as string;
		const value = e.currentTarget.value;// as string;
		this.setState((prevState => (
			{ ...prevState, [name]: value }
		)));
	};
	onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    
	}
	PrintList = (): JSX.Element => {
        let i: number = 0;
        const TypeAccess = (props: Props): JSX.Element => {
            const access: number = props.access;
            if (access === 0)
                return (<>Public</>)
            else if (access === 1)
                return (<>Private</>)
            else
                return (<>Protected</>)
        };

        return (<tbody>
            {this.state.listChannel &&
                this.state.listChannel.map((chan) => (
                    <tr key={++i}>
                        <td><Link to={{ pathname: "/channels/" + chan.id }}  state={{ name: chan.name }}>{chan.name}</Link></td><td>{chan.owner}</td><td><TypeAccess access={chan.access} /></td>
                    </tr>
                ))
            }
        </tbody>)
    }
    render(): JSX.Element {
        return (<section className='container'>
            <h1>List channels</h1>
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
		<form onSubmit="">
                <input type="text" onChange={this.onChange} placeholder='Enter channel name' name="channelName" />
                <input type="radio" onChange={this.onChange} name="rad" value="public" /><label>Public</label>
                <input type="radio" onChange={this.onChange} name="rad" value="private" /><label>Private</label>
                <input type="radio" onChange={this.onChange} name="rad" value="protected" /><label>Protected</label>
                <input type="password" onChange={this.onChange} placeholder='Password' name="password" />
                <input type="submit" onChange={this.onChange} value="Add Channel" />
         	</form>   
	</article>
            <Outlet />
        </section>);
    }
}

export default ListChannel;
