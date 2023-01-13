import React from 'react';
import { Link, Outlet } from "react-router-dom";
import "../css/channel.css"

type State = {
    listChannel: Array<{
        id: number,
        name: string,
        owner: string,
        access: number,
    }>
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
        }
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
                <input type="text" placeholder='Enter channel name' name="channelName" />
                <input type="radio" name="public" value="public" /><label>Public</label>
                <input type="radio" name="private" value="private" /><label>Private</label>
                <input type="radio" name="protected" value="protected" /><label>Protected</label>
                <input type="submit" value="Add Channel" />
            </article>
            <Outlet />
        </section>);
    }
}

export default ListChannel;