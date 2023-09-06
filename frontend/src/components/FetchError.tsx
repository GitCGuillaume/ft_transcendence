import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ContextDisplayChannel from '../contexts/DisplayChatContext';

export const FetchError = (props: { code: number }) => {
    const navigate = useNavigate();
    const { setDisplay } = useContext(ContextDisplayChannel);
    useEffect(() => {
        if (props.code === 403 || props.code === 401) {
            setDisplay(false);
            navigate("/logout");
        }
        else if (props.code >= 400 && props.code != 9999) {
            try {
                throw new Error('Error ' + props.code);
            } catch (e) {
                navigate("/error-page", { state: { code: props.code } });
            }
        } else if (props.code === 9999) {
            try {
                throw new Error('Error, something went wrong with the server, please contact administrator.');
            } catch (e) {
                navigate("/error-page", { state: { code: props.code } });
            }
        }
    }, [])
    return (<></>);
}

export const header = (jwt: Readonly<string | null>) => {
    const header = new Headers({
        Authorization: 'Bearer ' + jwt
    })
    return (header);
};

export const headerPost = (jwt: Readonly<string | null>) => {
    const header = new Headers({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt
    })
    return (header);
};
