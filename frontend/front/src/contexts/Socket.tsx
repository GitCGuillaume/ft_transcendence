import io from 'socket.io-client';
import { createContext } from 'react';

const token = window.navigator.userAgent;

export const usrSocket = io("http://" + location.host, {
    withCredentials: true,
    query: { token }
});
export const SocketContext = createContext(usrSocket);