import { SetStateAction } from "react";
import { Socket } from "socket.io-client";

class GameService {
  public async joinGameRoom(
    socket: Socket<any, any> | undefined,
    roomId: string,
    setUsr1:  React.Dispatch<React.SetStateAction<string>>,
    setUsr2:  React.Dispatch<React.SetStateAction<string>>
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      socket?.emit("join_game", { roomId });
      socket?.on("join_game_success", (res: {nbClient: number, username: string}) => {
        if (res.nbClient === 1) setUsr1(res.username);
        else if (res.nbClient === 2) setUsr2(res.username);
        resolve(true);
      });
      socket?.on("join_game_error", (res: { error: string }) => reject(res.error));
    });
  }

  public async updateGame(socket: Socket<any, any> | undefined, data: any): Promise<void> {
    socket?.emit("update_game", data);
  }

  public async updatePlayerPosition(
    socket: Socket<any, any> | undefined,
    data: number
  ): Promise<void> {
    socket?.emit("update_player_position", data);
  }

  public async updatePlayerTickCount(
    socket: Socket<any, any> | undefined,
    data: number
  ): Promise<void> {
    socket?.emit("update_player_tick_count", data);
  }

  public async onGameUpdate(
    socket: Socket<any, any> | undefined,
    callback: (data: any) => void
  ): Promise<void> {
    socket?.on("on_game_update", callback);
  }

  public async onGameStart(
    socket: Socket<any, any> | undefined,
    callback: (data: any) => void
  ): Promise<void> {
    socket?.on("start_game", callback);
  }

  public async onGameEnd(
    socket: Socket<any, any> | undefined,
    callback: (data: any) => void
  ): Promise<void> {
    socket?.on("end_game", callback);
  }
}

export default new GameService();
