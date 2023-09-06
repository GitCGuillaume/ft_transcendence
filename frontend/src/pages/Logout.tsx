import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import ContextDisplayChannel from '../contexts/DisplayChatContext';
import UserContext from "../contexts/UserContext";

type typeLogout = {
    usrSocket: Socket<any, any> | undefined,
    setUsrSocket: React.Dispatch<React.SetStateAction<Socket<any, any> | undefined>>
}

const LogOut = (props: typeLogout) => {
    const navigate = useNavigate();
    const userCtx: any = useContext(UserContext);
    const { setDisplay } = useContext(ContextDisplayChannel);
    const [finish, setFinish] = useState<boolean>(false);

    useEffect(() => {
        setDisplay(false);
        new Promise((resolve) => {
            resolve(userCtx.logoutUser());
        }).then(() => {
            if (props.usrSocket?.connected === true) {
                props.usrSocket.disconnect();
            }
            setFinish(true);
        }).catch(() => {
            navigate("/error-page", { state: { code: 520 } });
        });
    }, []);

    useEffect(() => {
        if (finish === true) {
            new Promise((resolve) => {
                resolve(props.setUsrSocket(undefined))
            })
                .then(() => {
                    navigate("/login");
                }).catch(() => {
                    navigate("/error-page", { state: { code: 520 } });
                });
        }
    }, [finish]);
    return (<></>);
}

export default LogOut;