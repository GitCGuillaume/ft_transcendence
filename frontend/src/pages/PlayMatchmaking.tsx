import { useContext, useEffect, useState } from "react";
import Game from "../components/game";
import SocketContext from '../contexts/Socket';
import { FetchError, header } from '../components/FetchError';
import { useParams, useNavigate } from "react-router-dom";

function PlayPageMatchmaking(props: { jwt: string | null }) {
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
                            navigate("/matchmaking");
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

export default PlayPageMatchmaking