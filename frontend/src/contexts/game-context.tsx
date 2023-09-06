import React from "react";

export interface IGameContext {
  idRoom: string;
  roomName: string;
  isInRoom: boolean;
  setInRoom: (inRoom: boolean) => void;
  playerSide: 1 | 2;
}

const defaultState: IGameContext = {
  idRoom: "",
  roomName: "",
  isInRoom: false,
  setInRoom: () => {},
  playerSide: 1,
};

export default React.createContext(defaultState);
