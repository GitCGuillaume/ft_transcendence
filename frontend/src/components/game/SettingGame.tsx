import React, { useEffect, useState } from "react";
import gameService from "../../services/gameService";
import { FetchError } from "../FetchError";
import ActivePowerUpsList from "./ActivePowerUpsList";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Socket } from "socket.io-client";

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

type typeObject = {
  ballSize: number;
  speed: number;
  acceleration: number;
  goal: number;
  ballColor: string;
  powerUps: boolean;
  type: string;
};

interface IGameSettings {
  powerUps: boolean;
  goal: number;
  speed: number;
  acceleration: number;
  ballSize: number;
  ballColor: string;
}

const globalSettings: IGameSettings = {
  powerUps: false,
  goal: 11,
  speed: 5,
  acceleration: 0.1,
  ballSize: 10,
  ballColor: "WHITE",
};

const resetGlobalSettings = () => {
  globalSettings.powerUps = false;
  globalSettings.goal = 11;
  globalSettings.speed = 5;
  globalSettings.acceleration = 0.1;
  globalSettings.ballSize = 10;
  globalSettings.ballColor = "WHITE";
};

const changeGlobalSettings = (settings: IGameSettings) => {
  globalSettings.powerUps = settings.powerUps;
  globalSettings.goal = settings.goal;
  globalSettings.speed = settings.speed;
  globalSettings.acceleration = settings.acceleration;
  globalSettings.ballSize = settings.ballSize;
  globalSettings.ballColor = settings.ballColor;
};

const ButtonIsCustom = (props: {
  usrSocket: Socket<any, any> | undefined;
  id: string;
  setRdy: React.Dispatch<React.SetStateAction<boolean>>;
  custom: boolean;
  setCustom: React.Dispatch<React.SetStateAction<boolean>>;
  sizeBall: string;
  setSizeBall: React.Dispatch<React.SetStateAction<string>>;
  speed: string;
  setSpeed: React.Dispatch<React.SetStateAction<string>>;
  acc: string;
  setAcc: React.Dispatch<React.SetStateAction<string>>;
  goal: string;
  setGoal: React.Dispatch<React.SetStateAction<string>>;
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
  isCheck: boolean;
  setIsCheck: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const handleRdy = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e && e.target) props.setCustom((prev: boolean) => !prev);
  };
  useEffect(() => {
    props.usrSocket?.on(
      "updateTypeGameFromServer",
      (res: { type: boolean }) => {
        props.setRdy(false);
        if (res) props.setCustom(res.type);
      }
    );
    return () => {
      props.usrSocket?.off("updateTypeGameFromServer");
    };
  }, []);
  useEffect(() => {
    props.usrSocket?.emit(
      "updateTypeGame",
      { type: props.custom, roomId: props.id },
      (res: { type: boolean }) => {
        props.setRdy(false);
        if (res) props.setCustom(res.type);
      }
    );
  }, [props.custom]);
  return (
    <>
      <button onClick={handleRdy}>
        {props.custom === false
          ? "Click to transform into custom game"
          : "Click to disable custom game"}
      </button>
      <Custom_setting
        cst={props.custom}
        usrSocket={props.usrSocket}
        id={props.id}
        setSizeBall={props.setSizeBall}
        sizeBall={props.sizeBall}
        speed={props.speed}
        setSpeed={props.setSpeed}
        acc={props.acc}
        setAcc={props.setAcc}
        goal={props.goal}
        setGoal={props.setGoal}
        color={props.color}
        setColor={props.setColor}
        isCheck={props.isCheck}
        setIsCheck={props.setIsCheck}
      />
    </>
  );
};

const ButtonRdy = (props: {
  usrSocket: Socket<any, any> | undefined;
  uid: string;
  usr1: string;
  usr2: string;
  rdy: boolean;
  setRdy: React.Dispatch<React.SetStateAction<boolean>>;
  custom: boolean;
  setCustom: React.Dispatch<React.SetStateAction<boolean>>;
  settings: typeObject;
}) => {
  const handleRdy = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e && e.target) {
      props.setRdy((prev: boolean) => !prev);
    }
  };

  useEffect(() => {
    props.usrSocket?.on("updateUserRdy", () => {
      props.setRdy(false);
      props.setCustom(false);
    });
    return () => {
      props.usrSocket?.off("updateUserRdy");
    };
  });

  useEffect(() => {
    props.usrSocket?.emit("userIsRdy", {
      uid: props.uid,
      usr1: props.usr1,
      usr2: props.usr2,
      rdy: props.rdy,
      custom: props.custom,
      settings: props.settings,
    });
  }, [props.rdy]);
  return (
    <button onClick={handleRdy}>
      {props.rdy === false ? "Click to be ready" : "Stop ready"}
    </button>
  );
};

const Custom_size_ball = (props: {
  usrSocket: Socket<any, any> | undefined;
  sizeBall: string;
  setSizeBall: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const handleChange = (e: any) => {
    if (e && e.target) {
      props.setSizeBall(e.target.value);
      globalSettings.ballSize = Number(e.target.value);
      if (!isNaN(Number(e.target.value)) && Number(e.target.value)) {
        props.usrSocket?.emit("edit_settings", { ...globalSettings });
      }
    }
  };
  useEffect(() => {
    props.usrSocket?.on("edit_settings", (res: IGameSettings) => {
      changeGlobalSettings(res);
      props.setSizeBall(res.ballSize.toString());
    });
    return () => {
      props.usrSocket?.off("edit_settings");
    };
  }, []);
  return (
    <div className="setting_row">
      <label className="setting_title">
        <b>Ball Size</b>
      </label>
      <div className="setting_choice_group">
        <button
          className={
            props.sizeBall === "5" ? "setting_choice_active" : "setting_choice"
          }
          style={{ width: "33%", minWidth: "33%", maxWidth: "33%" }}
          onClick={handleChange}
          value={5}
          name="size_ball"
        >
          Small
        </button>
        <button
          className={
            props.sizeBall === "10" ? "setting_choice_active" : "setting_choice"
          }
          style={{ width: "33%", minWidth: "33%", maxWidth: "33%" }}
          onClick={handleChange}
          value={10}
          name="size_ball"
        >
          Normal
        </button>
        <button
          className={
            props.sizeBall === "20" ? "setting_choice_active" : "setting_choice"
          }
          style={{ width: "33%", minWidth: "33%", maxWidth: "33%" }}
          onClick={handleChange}
          value={20}
          name="size_ball"
        >
          Big
        </button>
      </div>
    </div>
  );
};

const Custom_speed_ball = (props: {
  usrSocket: Socket<any, any> | undefined;
  speed: string;
  setSpeed: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const handleChange = (e: any) => {
    if (e && e.target) {
      props.setSpeed(e.target.value);
      globalSettings.speed = Number(e.target.value);
      if (!isNaN(Number(e.target.value)) && Number(e.target.value)) {
        props.usrSocket?.emit("edit_settings", { ...globalSettings });
      }
    }
  };
  useEffect(() => {
    props.usrSocket?.on("edit_settings", (res: IGameSettings) => {
      changeGlobalSettings(res);
      props.setSpeed(res.speed.toString());
    });
    return () => {
      props.usrSocket?.off("edit_settings");
    };
  }, []);
  return (
    <div className="setting_row">
      <label className="setting_title">
        <b>Ball Speed</b>
      </label>
      <div className="setting_choice_group">
        <button
          className={
            props.speed === "3" ? "setting_choice_active" : "setting_choice"
          }
          style={{ width: "33%", minWidth: "33%", maxWidth: "33%" }}
          onClick={handleChange}
          value={3}
          name="speed_ball"
        >
          Slow
        </button>
        <button
          className={
            props.speed === "5" ? "setting_choice_active" : "setting_choice"
          }
          style={{ width: "33%", minWidth: "33%", maxWidth: "33%" }}
          onClick={handleChange}
          value={5}
          name="speed_ball"
        >
          Average
        </button>
        <button
          className={
            props.speed === "10" ? "setting_choice_active" : "setting_choice"
          }
          style={{ width: "33%", minWidth: "33%", maxWidth: "33%" }}
          onClick={handleChange}
          value={10}
          name="speed_ball"
        >
          Fast
        </button>
      </div>
    </div>
  );
};

const Custom_acceleration_ball = (props: {
  usrSocket: Socket<any, any> | undefined;
  acc: string;
  setAcc: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const handleChange = (e: any) => {
    if (e && e.target) {
      props.setAcc(e.target.value);
      globalSettings.acceleration = Number(e.target.value);
      if (!isNaN(Number(e.target.value)) && Number(e.target.value)) {
        props.usrSocket?.emit("edit_settings", { ...globalSettings });
      }
    }
  };
  useEffect(() => {
    props.usrSocket?.on("edit_settings", (res: IGameSettings) => {
      changeGlobalSettings(res);
      props.setAcc(res.acceleration.toString());
    });
    return () => {
      props.usrSocket?.off("edit_settings");
    };
  }, []);
  return (
    <div className="setting_row">
      <label className="setting_title">
        <b>Ball Acceleration</b>
      </label>
      <div className="setting_choice_group">
        <button
          className={
            props.acc === "0.1" ? "setting_choice_active" : "setting_choice"
          }
          style={{ width: "33%", minWidth: "33%", maxWidth: "33%" }}
          onClick={handleChange}
          value={0.1}
          name="acc_ball"
        >
          Normal
        </button>
        <button
          className={
            props.acc === "0.2" ? "setting_choice_active" : "setting_choice"
          }
          style={{ width: "33%", minWidth: "33%", maxWidth: "33%" }}
          onClick={handleChange}
          value={0.2}
          name="acc_ball"
        >
          Speed
        </button>
        <button
          className={
            props.acc === "0.4" ? "setting_choice_active" : "setting_choice"
          }
          style={{ width: "33%", minWidth: "33%", maxWidth: "33%" }}
          onClick={handleChange}
          value={0.4}
          name="acc_ball"
        >
          Sonic
        </button>
      </div>
    </div>
  );
};

const Custom_goal = (props: {
  usrSocket: Socket<any, any> | undefined;
  goal: string;
  setGoal: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const handleChange = (e: any) => {
    if (e && e.target) {
      props.setGoal(e.target.value);
      globalSettings.goal = Number(e.target.value);
      if (!isNaN(Number(e.target.value)) && Number(e.target.value)) {
        props.usrSocket?.emit("edit_settings", { ...globalSettings });
      }
    }
  };
  useEffect(() => {
    props.usrSocket?.on("edit_settings", (res: IGameSettings) => {
      changeGlobalSettings(res);
      props.setGoal(res.goal.toString());
    });
    return () => {
      props.usrSocket?.off("edit_settings");
    };
  }, []);
  return (
    <div className="setting_row">
      <label className="setting_title">
        <b>Score to Win</b>
      </label>
      <div className="setting_choice_group">
        <button
          className={
            props.goal === "11" ? "setting_choice_active" : "setting_choice"
          }
          style={{ width: "33%", minWidth: "33%", maxWidth: "33%" }}
          onClick={handleChange}
          value={11}
          name="goal_ball"
        >
          Normal
        </button>
        <button
          className={
            props.goal === "21" ? "setting_choice_active" : "setting_choice"
          }
          style={{ width: "33%", minWidth: "33%", maxWidth: "33%" }}
          onClick={handleChange}
          value={21}
          name="goal_ball"
        >
          Long
        </button>
        <button
          className={
            props.goal === "42" ? "setting_choice_active" : "setting_choice"
          }
          style={{
            width: "33%",
            minWidth: "33%",
            maxWidth: "33%",
          }}
          onClick={handleChange}
          value={42}
          name="goal_ball"
        >
          Cursus
        </button>
      </div>
    </div>
  );
};

const Custom_color_ball = (props: {
  usrSocket: Socket<any, any> | undefined;
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const handleChange = (e: any) => {
    if (e && e.target) {
      props.setColor(e.target.value);
      globalSettings.ballColor = e.target.value;
      props.usrSocket?.emit("edit_settings", { ...globalSettings });
    }
  };
  useEffect(() => {
    props.usrSocket?.on("edit_settings", (res: IGameSettings) => {
      changeGlobalSettings(res);
      props.setColor(res.ballColor);
    });
    return () => {
      props.usrSocket?.off("edit_settings");
    };
  }, []);
  return (
    <div className="setting_row">
      <label className="setting_title">
        <b>Color Ball</b>
      </label>
      <br />
      <select value={props.color} name="color_ball" onChange={handleChange}>
        <option value={"WHITE"}>WHITE</option>
        <option value={"RED"}>RED</option>
        <option value={"GREEN"}>GREEN</option>
        <option value={"BLUE"}>BLUE</option>
        <option value={"YELLOW"}>YELLOW</option>
        <option value={"PURPLE"}>PURPLE</option>
        <option value={"ORANGE"}>ORANGE</option>
        <option value={"PINK"}>PINK</option>
        <option value={"BROWN"}>BROWN</option>
      </select>
    </div >
  );
};

const Custom_power_up = (props: {
  usrSocket: Socket<any, any> | undefined;
  isCheck: boolean;
  setIsCheck: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const handleCheck = (e: any) => {
    if (e && e.target) {
      props.setIsCheck((isCheck: boolean) => !isCheck);
      globalSettings.powerUps = !props.isCheck;
      props.usrSocket?.emit("edit_settings", { ...globalSettings });
    }
  };
  useEffect(() => {
    props.usrSocket?.on("edit_settings", (res: IGameSettings) => {
      changeGlobalSettings(res);
      props.setIsCheck(res.powerUps);
    });
    return () => {
      props.usrSocket?.off("edit_settings");
    };
  }, []);
  return (
    <div className="setting_row">
      <label className="setting_title">
        <b>Power Ups</b>
      </label>
      <button
        className={props.isCheck ? "setting_choice_active" : "setting_choice"}
        style={{ width: "67%", minWidth: "67%", maxWidth: "67%" }}
        onClick={handleCheck}
        name="Power_Up"
        value="powerUp"
      >
        {props.isCheck ? "ON" : "OFF"}
      </button>
    </div>
  );
};

const Custom_setting = (props: {
  cst: boolean;
  usrSocket: Socket<any, any> | undefined;
  id: string;
  sizeBall: string;
  setSizeBall: React.Dispatch<React.SetStateAction<string>>;
  speed: string;
  setSpeed: React.Dispatch<React.SetStateAction<string>>;
  acc: string;
  setAcc: React.Dispatch<React.SetStateAction<string>>;
  goal: string;
  setGoal: React.Dispatch<React.SetStateAction<string>>;
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
  isCheck: boolean;
  setIsCheck: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  useEffect(() => {
    props.usrSocket?.on("edit_settings", (res: IGameSettings) => {
      changeGlobalSettings(res);
    });
    return () => {
      props.usrSocket?.off("edit_settings");
    };
  }, []);
  if (props.cst === true) {
    props.usrSocket?.emit("edit_settings", { ...globalSettings });
    return (
      <div className="settings_container">
        <br />
        <label>Custom game</label>
        <br />
        <br />
        <Custom_size_ball
          usrSocket={props.usrSocket}
          sizeBall={props.sizeBall}
          setSizeBall={props.setSizeBall}
        />
        <br />
        <br />
        <Custom_speed_ball
          usrSocket={props.usrSocket}
          speed={props.speed}
          setSpeed={props.setSpeed}
        />
        <br />
        <br />
        <Custom_acceleration_ball
          usrSocket={props.usrSocket}
          acc={props.acc}
          setAcc={props.setAcc}
        />
        <br />
        <br />
        <Custom_goal
          usrSocket={props.usrSocket}
          goal={props.goal}
          setGoal={props.setGoal}
        />
        <br />
        <br />
        <Custom_color_ball
          usrSocket={props.usrSocket}
          color={props.color}
          setColor={props.setColor}
        />
        <br />
        <br />
        <Custom_power_up
          usrSocket={props.usrSocket}
          isCheck={props.isCheck}
          setIsCheck={props.setIsCheck}
        />
        <br />
      </div>
    );
  } else {
    resetGlobalSettings();
    props.usrSocket?.emit("edit_settings", { ...globalSettings });
    return <></>;
  }
};

const ListUser = (props: { usr1: string; usr2: string }) => {
  return (
    <div>
      <label>User 1: {props.usr1}</label>
      <br />
      <label>User 2: {props.usr2}</label>
    </div>
  );
};

interface IPowerUp {
  type: string;
  user: string;
  imageURL: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  active: boolean;
  lifespan: number;
}

const MatchmakingLeft = (props: {
  userLeft: boolean;
  usr1: string;
  usr2: string;
}) => {
  const navigate = useNavigate();
  let getTimer: null | number = null;
  let getTimer2: null | number = null;

  function redirect() {
    navigate("/matchmaking");
  }
  //if opponent not coming after x seconds, then go back to matchmaking page
  useEffect(() => {
    if ((!props.usr1 || !props.usr2) && props.userLeft === false)
      getTimer = setTimeout(redirect, 45000);
    if (getTimer && props.usr1 && props.usr2) clearTimeout(getTimer);
    return () => {
      if (getTimer) clearTimeout(getTimer);
    };
  }, [props.usr1, props.usr2]);

  //if user leave during matchmaking waiting room
  useEffect(() => {
    if (props.userLeft === true) {
      if (getTimer) clearTimeout(getTimer);
      getTimer2 = setTimeout(redirect, 5000);
    }
    return () => {
      if (getTimer2) clearTimeout(getTimer2);
    };
  }, [props.userLeft]);

  return (
    <>
      {(!props.usr1 || !props.usr2) && props.userLeft === false && (
        <div className="game_container">
          <p>
            If opponent not coming in 45 seconds, you will be sent back to
            matchmaking page...
          </p>
        </div>
      )}
      {props.userLeft === true && (
        <div className="game_container">
          <p>Opponent left, redirection into matchmaking in 5 seconds...</p>
        </div>
      )}
    </>
  );
};

const SettingGame = (props: {
  socketService: { socket: Socket<any, any> | undefined };
  id: string;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  isGameStarted: boolean;
  powerUpList: IPowerUp[];
  side: number;
  roomName: string;
}) => {
  const [errorCode, setErrorCode] = useState<number>(200);
  const [usr1, setUsr1] = useState<string>("");
  const [usr2, setUsr2] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");
  const url = useParams().id as string;
  const [userLeft, setLeft] = useState<boolean>(false);
  const regex = RegExp(/(\/[\w-]*\/)/, "g");
  const getLocation = useLocation()?.pathname;
  const getFirstPartRegex = regex.exec(getLocation);

  useEffect(() => {
    if (props.socketService.socket) {
      props.socketService.socket.emit("userInGame");
      const game = async () => {
        await gameService
          .joinGameRoom(props.socketService.socket, props.id, setUsr1, setUsr2)
          .catch((err: string) => {
            setErrorText(err);
            setErrorCode(1);
            props.socketService.socket?.off("join_game_success");
          });
      };
      game();
    }
    return () => {
      props.socketService.socket?.emit("leave_game", { roomId: props.id });
      props.socketService.socket?.off("join_game_success");
      props.socketService.socket?.off("join_game_error");
    };
  }, [props.socketService.socket, url]);

  useEffect(() => {
    props.socketService.socket?.on(
      "user_leave_room",
      (res: { username: string }) => {
        if (res && res.username === usr1) {
          setUsr1("");
        }
        if (res && res.username === usr2) {
          setUsr2("");
        }
        if (
          res.username &&
          getFirstPartRegex &&
          getFirstPartRegex[0] == "/play-matchmaking/"
        )
          setLeft(true);
      }
    );
    return () => {
      props.socketService.socket?.off("user_leave_room");
    };
  }, [usr1, usr2, url]);

  const [custom, setCustom] = useState<boolean>(false);
  const [rdy, setRdy] = useState<boolean>(false);
  const [sizeBall, setSizeBall] = useState<string>("10");
  const [speed, setSpeed] = useState<string>("5");
  const [acc, setAcc] = useState<string>("0.1");
  const [goal, setGoal] = useState<string>("11");
  const [color, setColor] = useState<string>("WHITE");
  const [isCheck, setIsCheck] = useState<boolean>(false);

  useEffect(() => {
    setRdy(false);
  }, [sizeBall, speed, custom, acc, goal, color, isCheck]);
  let settings: typeObject = {
    ballSize: Number(sizeBall),
    speed: Number(speed),
    acceleration: Number(acc),
    goal: Number(goal),
    ballColor: color,
    powerUps: isCheck,
    type: "",
  };
  if (getFirstPartRegex && getFirstPartRegex[0] == "/play-invite/")
    settings.type = "Invitation";
  else settings.type = "Classic";
  if (custom === true) settings.type = "Custom";
  if (!props.isGameStarted) {
    return (
      <>
        {errorCode >= 400 && <FetchError code={errorCode} />}
        {getFirstPartRegex && getFirstPartRegex[0] == "/play-matchmaking/" && (
          <MatchmakingLeft userLeft={userLeft} usr1={usr1} usr2={usr2} />
        )}
        <div className="createParty">
          <h1 className="room_name">{props.roomName}</h1>
          {errorCode != 1 ? (
            <h1>waiting for opponent</h1>
          ) : (
            <h1>Error : {errorText}</h1>
          )}
          {errorCode != 1 && (
            <>
              <ListUser usr1={usr1} usr2={usr2} />
              <ButtonIsCustom
                usrSocket={props.socketService.socket}
                id={props.id}
                setRdy={setRdy}
                custom={custom}
                setCustom={setCustom}
                sizeBall={sizeBall}
                setSizeBall={setSizeBall}
                speed={speed}
                setSpeed={setSpeed}
                acc={acc}
                setAcc={setAcc}
                goal={goal}
                setGoal={setGoal}
                color={color}
                setColor={setColor}
                isCheck={isCheck}
                setIsCheck={setIsCheck}
              />
              <br />
              <ButtonRdy
                usrSocket={props.socketService.socket}
                uid={props.id}
                usr1={usr1}
                usr2={usr2}
                rdy={rdy}
                setRdy={setRdy}
                custom={custom}
                setCustom={setCustom}
                settings={settings}
              />
            </>
          )}
        </div>
      </>
    );
  } else {
    return (
      <>
        {errorCode >= 400 && <FetchError code={errorCode} />}
        <div className="game_container">
          <h1 className="room_name">{props.roomName}</h1>
          <div className="game">
            <canvas
              ref={props.canvasRef}
              className="game_canvas"
              id="pong"
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
            ></canvas>
            <ActivePowerUpsList
              powerUps={props.powerUpList}
              side={props.side}
            />
          </div>
        </div>
      </>
    );
  }
};

export default SettingGame;
