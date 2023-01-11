import React from 'react';
import "../css/channel.css"

class ListChannel extends React.Component<{}, {}> {
    render () {
        return (<section className='container'>
            <h1>List channels</h1>
            <article className='left'>
                <table>
                    <thead>
                        <tr>
                            <th>Channel list</th><th>Owner</th><th>Access type</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>name channel hard coded</td><td>gchopin hard coded</td><td>protected</td>
                        </tr>
                        <tr>
                            <td>name channel hard coded</td><td>gchopin hard coded</td><td>protected</td>
                        </tr>
                        <tr>
                            <td>name channel hard coded</td><td>gchopin hard coded</td><td>protected</td>
                        </tr>
                        <tr>
                            <td>name channel hard coded</td><td>gchopin hard coded</td><td>protected</td>
                        </tr>
                        <tr>
                            <td>name channel hard coded</td><td>gchopin hard coded</td><td>protected</td>
                        </tr>
                        <tr>
                            <td>name channel hard coded</td><td>gchopin hard coded</td><td>protected</td>
                        </tr>
                    </tbody>
                </table>
            </article>
            <article className='right'>
                <table>
                    <thead>
                        <tr>
                            <th>User(s) connected</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                usernameusernameusername
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="userInfo">
                    <label className="userInfo">display:flex/none User Info</label>
                    <label className="userInfo">button to click</label>
                    <label className="userInfo">button to click</label>
                    <label className="userInfo">button to click</label>
                    <label className="userInfo">button to click</label>
                    <label className="userInfo">button to click</label>
                </div>
            </article>
            <article className='bottom'>
                <input type="text" placeholder='Enter channel name' name="channelName"/>
                <input type="radio" name="private" value="private" checked/><label>Public</label>
                <input type="radio" name="private" value="private"/><label>Private</label>
                <input type="radio" name="private" value="private"/><label>Protected</label>
                <input type="submit" value="Add Channel" />
            </article>
        </section>);
    } 
}

export default ListChannel;