import React from "react";
import RoomItem from "./RoomItem";

interface IRoomProps {
  rooms: any;
  join: any;
}

export default function RoomList(props: IRoomProps) {
  return (
    <div className="room_list_container">
      <h2>Room List</h2>
      <div className="room_list">
        {props.rooms.map((item: any) => (
          <RoomItem
            key={item.id}
            uid={item.uid}
            roomName={item.roomName}
            join={props.join}
          />
        ))}
      </div>
    </div>
  );
}
