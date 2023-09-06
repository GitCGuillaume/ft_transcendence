import { Socket } from 'socket.io-client';
import React, { createContext, useEffect, useState } from 'react';
import { FetchError } from '../components/FetchError';

type typeSocket = {
    usrSocket: Socket<any, any> | undefined,
}

const defaultValue: any = () => { }

const SocketContext = createContext<typeSocket>({
    usrSocket: defaultValue,
});

export const SocketProvider = (props: { jwt: string | null, usrSocket: Socket<any, any> | undefined, children: any }) => {
    const context: typeSocket = {
        usrSocket: props.usrSocket
    }
    const [errorCode, setErrorCode] = useState<number>(200);

    useEffect(() => {
        if (props.jwt && props.jwt != ""
            && props.usrSocket?.connected === true) {
            props.usrSocket?.on('exception', (res: any) => {
                if (res && res.status === "error" && res.message === "Token not valid") {
                    setErrorCode(403)
                }
                else {
                    setErrorCode(500);
                }
            });
        }
        return (() => {
            props.usrSocket?.off('exception');
        });
    }, [props.usrSocket?.connected, props.jwt]);

    return (
        <SocketContext.Provider value={context}>
            {errorCode && errorCode >= 400 && <FetchError code={errorCode} />}
            {props.children}
        </SocketContext.Provider>
    )
}
export default SocketContext;


