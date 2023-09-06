import React, { useRef, useState } from "react";
import { FetchError, headerPost } from '../FetchError';

function NewRoomModal(props: any) {
    const roomNameInputRef = useRef<HTMLInputElement>(null);
    const [errorCode, setErrorCode] = useState<number>(200);

    async function createRoomHandler(roomname: string) {
        let room: string = "";
        await fetch("https://" + location.host + "/api/rooms/create", {
            method: "POST",
            body: JSON.stringify({
                roomName: roomname,
            }),
            headers: headerPost(props.jwt)
        })
            .then((response) => {
                if (response && response.ok)
                    return response.json();
                if (response)
                    setErrorCode(response.status);
            })
            .then((data) => {
                if (data && data.err === "true") {
                    setErrorCode(1);
                    return ("");
                }
                if (data && data.err && data.err !== "true") {
                    setErrorCode(2);
                    return ("");
                }
                if (data && !data.err && data.uid) {
                    room = data.uid;
                }
            }).catch(err => console.log(err));
        return room;
    }

    async function submitHandler(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!roomNameInputRef.current) {
            return;
        }
        const roomName = roomNameInputRef.current.value;
        const room = await createRoomHandler(roomName);

        props.onSubmit(room);
        if (room && room != "")
            props.onCancel();
    }

    function cancelHandler() {
        props.onCancel();
    }

    return (
        <>
            {errorCode && errorCode >= 401 && <FetchError code={errorCode} />}
            <div className='modal'>
                <form onSubmit={submitHandler}>
                    <p style={{ "color": "black" }}>Create new room</p>
                    <input
                        type="text"
                        placeholder="room name"
                        ref={roomNameInputRef}
                    />
                    <button className="btn" type="submit">Create</button>
                    <button className="btn btn-second" onClick={cancelHandler}>Cancel</button>
                </form>
                {errorCode === 1 && <p style={{ "color": "red" }}>room name length too big, too little, or use alpha-numeric name format</p>}
                {errorCode === 2 && <p style={{ "color": "red" }}>You are already in a game.</p>}
                {errorCode === 400 && <p style={{ "color": "red" }}>Please enter a correct name format, at least 3 characters</p>}
            </div>
        </>
    );
}

export default NewRoomModal;