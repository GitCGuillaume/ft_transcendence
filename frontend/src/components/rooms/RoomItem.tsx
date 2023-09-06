import React from "react";

type RoomProps = {
  uid: string;
  roomName: string;
  join: any;
};

function RoomItem(props: RoomProps) {
  function joinRoom() {
    props.join(props.uid);
  }

  return (
    <div className="room_item" onClick={joinRoom}>
      <span className="room_name">{props.roomName}</span>
    </div>
  );
}

export default RoomItem;
