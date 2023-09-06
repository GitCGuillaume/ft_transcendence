import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { lstMsg } from '../components/Chat/Chat';
import { FetchError, header } from '../components/FetchError';

export type typeListUser = {
    listUser: Array<{
        list_user_user_id: number,
        list_user_role: string | null,
        fl: number | null,
        bl: number | null,
        User_username: string,
        User_avatarPath: string | null
    }>
}

export type typeListUserGlobal = {
    listUser: Array<{
        id: number,
        fl: number | null,
        bl: number | null,
        User_username: string,
        User_avatarPath: string | null
    }>
}

type contextDisplay = {
    renderDirectMessage: boolean,
    userId: number,
    id: string,
    lstMsgChat: lstMsg[],
    lstMsgPm: lstMsg[],
    lstUserChat: typeListUser["listUser"],
    lstUserGlobal: typeListUserGlobal["listUser"],
    setDisplay: React.Dispatch<React.SetStateAction<boolean>>,
    setUserId: React.Dispatch<React.SetStateAction<number>>,
    setId: React.Dispatch<React.SetStateAction<string>>,
    setLstMsgChat: React.Dispatch<React.SetStateAction<lstMsg[]>>,
    setLstMsgPm: React.Dispatch<React.SetStateAction<lstMsg[]>>,
    setLstUserChat: React.Dispatch<React.SetStateAction<typeListUser["listUser"]>>
    setLstUserGlobal: React.Dispatch<React.SetStateAction<typeListUserGlobal["listUser"]>>
}

const defaultValue = () => { }

const ContextDisplayChannel = React.createContext<contextDisplay>({
    renderDirectMessage: false,
    userId: 0,
    id: "",
    lstMsgChat: [] as lstMsg[],
    lstMsgPm: [] as lstMsg[],
    lstUserChat: [] as typeListUser["listUser"],
    lstUserGlobal: [] as typeListUserGlobal["listUser"],
    setDisplay: defaultValue,
    setUserId: defaultValue,
    setId: defaultValue,
    setLstMsgChat: defaultValue,
    setLstMsgPm: defaultValue,
    setLstUserChat: defaultValue,
    setLstUserGlobal: defaultValue
});

export const LoadUserGlobal = (props: { jwt: string | null }) => {
    const { setLstUserGlobal } = useContext(ContextDisplayChannel);
    const [errorCode, setErrorCode] = useState<number>(200);

    useEffect(() => {
        fetch('https://' + location.host + '/api/users/fr-bl-list', { headers: header(props.jwt) })
            .then(res => {
                if (res.ok)
                    return (res.json());
                if (res)
                    setErrorCode(res.status);
            }).then(res => {
                if (res)
                    setLstUserGlobal(res);
            })
            .catch(err => {
                console.log(err)
                setErrorCode(9999);
            });
        return (() => { });
    }, [props.jwt]);
    return (<>{errorCode && errorCode >= 400 && <FetchError code={errorCode} />}</>);
}

type typeFlBl = {
    id: number,
    fl: number | null,
    bl: number | null,
    User_username: string,
    User_avatarPath: string | null
}

export const updateBlackFriendList = (
    user: typeFlBl,
    lstUserGlobal: Array<typeFlBl>,
    setLstUserGlobal: React.Dispatch<React.SetStateAction<Array<typeFlBl>>>
) => {
    const search = () => {
        const found = lstUserGlobal.find(elem => Number(elem.id) === user.id);
        return (found);
    }

    if (lstUserGlobal && search()) {
        //update array
        const newArr = lstUserGlobal.map((value) => {
            if (value && Number(value.id) === user.id) {
                value.bl = user.bl;
                value.fl = user.fl;
            }
            return (value);
        });
        setLstUserGlobal(newArr);
    } else if (user.bl == 1 || user.fl == 2) {
        setLstUserGlobal(prev => [...prev, user]);
    }
}

const InviteGame = (props: { userIdInvitation: number, uid: string | null, setInvitation: any }) => {
    const navigate = useNavigate();
    const handleNo = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (e && e.target)
            props.setInvitation(0);
    }
    const handleYes = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (e && e.target && props.uid) {
            props.setInvitation(0);
            navigate({ pathname: '/play-invite/' + props.uid });
        }
    }

    if (props.userIdInvitation != 0 && !isNaN(props.userIdInvitation)) {
        return (<div className="invite-game">
            <span>Accept invitation</span>
            <br></br>
            <button onClick={handleYes} className="left">Yes</button>
            <button onClick={handleNo} className="right">No</button>
        </div>);
    }
    return (<></>);
}

export const DisplayChatGlobalProvider = (props: {
    jwt: string | null,
    usrSocket: Socket<any, any> | undefined, children: any
}) => {
    const [errorCode, setErrorCode] = useState<number>(200);
    const [renderDirectMessage, setDisplay] = useState<boolean>(false);
    const [userId, setUserId] = useState<number>(0);
    const [id, setId] = useState<string>("");
    const [lstMsgChat, setLstMsgChat] = useState<lstMsg[]>([] as lstMsg[]);
    const [lstMsgPm, setLstMsgPm] = useState<lstMsg[]>([] as lstMsg[]);
    const [lstUserChat, setLstUserChat] = useState<typeListUser["listUser"]>(Array);
    const [lstUserGlobal, setLstUserGlobal] = useState<typeListUserGlobal["listUser"]>(Array);

    const providers = {
        renderDirectMessage: renderDirectMessage,
        userId: userId,
        id: id,
        lstMsgChat: lstMsgChat,
        lstMsgPm: lstMsgPm,
        lstUserChat: lstUserChat,
        lstUserGlobal: lstUserGlobal,
        setDisplay: setDisplay,
        setUserId: setUserId,
        setId: setId,
        setLstMsgChat: setLstMsgChat,
        setLstMsgPm: setLstMsgPm,
        setLstUserChat: setLstUserChat,
        setLstUserGlobal: setLstUserGlobal
    };
    const [userIdInvitation, setInvitation] = useState<number>(0);
    const [uid, setUid] = useState<string | null>(null);

    useEffect(() => {
        props.usrSocket?.on('inviteGame', (res: any) => {
            if (lstUserGlobal) {
                let found = lstUserGlobal.find(elem => elem.id === res.user_id && elem.bl === 1);
                if (!found) {
                    setInvitation(res.user_id);
                    setUid(res.idGame);
                }
            }
        });
        return (() => {
            props.usrSocket?.off('inviteGame');
        });
    }, [props.jwt, props.usrSocket, lstUserGlobal]);

    return (
        <ContextDisplayChannel.Provider value={providers}>
            <InviteGame userIdInvitation={userIdInvitation} uid={uid} setInvitation={setInvitation} />
            {errorCode && errorCode >= 400 && <FetchError code={errorCode} />}
            {props.children}
        </ContextDisplayChannel.Provider>
    );
}

export default ContextDisplayChannel;