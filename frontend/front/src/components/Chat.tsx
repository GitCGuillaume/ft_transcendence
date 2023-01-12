import React from 'react';
import ListUser from './ListUser'
import "../css/chat.css"

class Chat extends React.Component<{}, {}> {
    render(): JSX.Element {
        return (<>
            <div className='container-chat'>test</div>
            <article className='right'>
                <ListUser />
            </article>
        </>
        )
    }
}

export default Chat;