import React, { useContext, useEffect, useState } from "react";
import Game from "../components/game";
import SocketContext from '../contexts/Socket';
import { FetchError, header, headerPost } from '../components/FetchError';
import { useParams, useNavigate, NavigateFunction } from "react-router-dom";

export function playPageInvite(jwt: string, setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    focusUserId: number, navigate: NavigateFunction) {

    async function addRoomHandler(jwt: string,
        setErrorCode: React.Dispatch<React.SetStateAction<number>>,
        focusUserId: number) {
        await fetch("https://" + location.host + "/api/rooms/create-private", {
            method: "POST",
            body: JSON.stringify({
                id: focusUserId,
            }),
            headers: headerPost(jwt)
        })
            .then((response) => {
                if (response && response.ok)
                    return response.json();
                if (response)
                    setErrorCode(response.status);
            })
            .then((data) => {
                if (data) {
                    if (!data.uid || data.uid === "")
                        return;
                    navigate({ pathname: '/play-invite/' + data.uid });
                }
            }).catch(err => console.log(err));
    }
    addRoomHandler(jwt, setErrorCode, focusUserId);
}

function PlayPageInvite(props: { jwt: string | null }) {
    const [errorCode, setErrorCode] = useState<number>(200);
    const id = useParams().id as string;
    const { usrSocket } = useContext(SocketContext);
    const navigate = useNavigate();
    const [loadParty, setLoadParty] = useState<boolean>(false);

    useEffect(() => {
        const ft_fetch = async () => {
            await fetch('https://' + location.host + '/api/rooms/get?' + new URLSearchParams({
                id: id,
            }),
                { headers: header(props.jwt) })
                .then(res => {
                    if (res && res.ok)
                        return (res.json());
                    if (res)
                        setErrorCode(res.status);
                })
                .then((res: { exist: boolean }) => {
                    if (res) {
                        if (res.exist === false)
                            navigate("/");
                        else if (res.exist === true)
                            setLoadParty(true);
                    }
                })
                .catch(e => console.log(e));
        }
        ft_fetch();
        return (() => {
            usrSocket?.emit("leave_game", { roomId: id });
            setLoadParty(false);
        });
    }, [props.jwt, id]);
    return (<>
        {loadParty === false && <div>Loading room...</div>}
        {errorCode >= 400 && <FetchError code={errorCode} />}
        {id && id != "" && loadParty === true && <Game id={id} usrSocket={usrSocket} jwt={props.jwt} roomName="" />}
    </>
    );
}

export default PlayPageInvite