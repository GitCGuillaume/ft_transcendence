import { useEffect, useContext, useState } from "react";
import Modal from "../components/rooms/NewRoomModal";
import Backdrop from "../components/backdrop";
import RoomList from "../components/rooms/RoomList";
import GameContext, { IGameContext } from "../contexts/game-context";
import Game from "../components/game";
import SocketContext from "../contexts/Socket";
import { FetchError, header } from "../components/FetchError";

export default function PlayPage(props: { jwt: string | null }) {
  const [idRoom, setIdRoom] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedRooms, setLoadedRooms] = useState([] as any);
  const [isInRoom, setIsInRoom] = useState(false);
  const gameContextValue: IGameContext = {
    idRoom: idRoom,
    roomName: roomName,
    isInRoom: isInRoom,
    setInRoom: setIsInRoom,
    playerSide: 1,
  };
  const [errorCode, setErrorCode] = useState<number>(200);
  const { usrSocket } = useContext(SocketContext);

  useEffect(() => {
    fetch("https://" + location.host + "/api/rooms", {
      headers: header(props.jwt),
    })
      .then((response) => {
        if (response && response.ok) return response.json();
        if (response) setErrorCode(response.status);
      })
      .then((data) => {
        const rooms: any = [];
        for (const key in data) {
          const room = {
            id: key,
            ...data[key],
          };
          rooms.push(room);
        }
        setLoadedRooms(rooms);
        setIsLoading(false);
      })
      .catch((err) => console.log(err));
    return () => {
      setLoadedRooms([]);
    };
  }, []);

  const joinRoom = async (roomId: string) => {
    if (!usrSocket) {
      return;
    }
    setIsLoading(true);
    if (roomId && roomId != "") {
      let roomName = "";
      await fetch(`https://${location.host}/api/rooms/${roomId}`, {
        headers: header(props.jwt),
      })
        .then((response) => {
          if (response && response.ok) return response.json();
          if (response) setErrorCode(response.status);
        })
        .then((data) => {
          if (data)
            roomName = data.roomName;
        }).catch(err => console.log(err));
      setRoomName(roomName);
      setIdRoom(roomId);
      setIsInRoom(true);
    }
    setIsLoading(false);
  };

  function openModalHandler() {
    setModalIsOpen(true);
  }

  function closeModalHandler() {
    setModalIsOpen(false);
  }

  if (isInRoom) {
    return <Game id={idRoom} usrSocket={usrSocket} roomName={roomName} jwt={props.jwt} />;
  }

  return (
    <GameContext.Provider value={gameContextValue}>
      {errorCode && errorCode >= 400 && <FetchError code={errorCode} />}
      <button className="btn" onClick={openModalHandler}>
        Create New Room
      </button>
      {modalIsOpen && (
        <Modal
          jwt={props.jwt}
          onCancel={closeModalHandler}
          onSubmit={joinRoom}
        />
      )}
      {modalIsOpen && <Backdrop onClick={closeModalHandler} />}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <RoomList rooms={loadedRooms} join={joinRoom} />
      )}
    </GameContext.Provider>
  );
}
