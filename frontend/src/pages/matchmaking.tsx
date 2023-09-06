import React, { useEffect, useState, useContext } from "react";
import SocketContext from "../contexts/Socket";
import { useNavigate } from "react-router-dom";
import { Box, Button, Text } from "@chakra-ui/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MMloading from "../assets/MMloadinggif.gif";
import "./matchmaking.css";
import { FetchError } from "../components/FetchError";

export default function MatchmakingPage() {
  const navigate = useNavigate();
  const { usrSocket } = useContext(SocketContext);

  const findMatch = () => {
    usrSocket?.emit("queuein", (res: any) => {});
  };

  //I force queue out the user in the situations I throw the toast so they can requeue without issue
  const toastFailedQueue = () => {
    toast(
      "🦄 Matchmaking failed due to already being in queue! \n You've been queued out, please try the matchmaking again",
      {
        position: "top-right",
        toastId: "toastFailedQueue",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      }
    );
  };

  const stopFindingMatch = () => {
    usrSocket?.emit("queueout");
  };

  const [errorCode, setErrorCode] = useState<number>(200);
  const [Queue, enterQueue] = useState(false);

  useEffect(() => {
    usrSocket?.on("matchmakingfailed", (res: any) => {
      stopFindingMatch();
      enterQueue(false);
      toastFailedQueue();
    });

    usrSocket?.on("matchmakeGame", (res: any) => {
      navigate({ pathname: "/play-matchmaking/" + res.idGame });
    });
    return () => {
      stopFindingMatch();
      enterQueue(false); //resets button&spinner
      usrSocket?.off("matchmakingfailed");
      usrSocket?.off("matchmakeGame");
    };
  }, [usrSocket]);

  const startMatching = (
    e: React.MouseEvent<HTMLButtonElement> | undefined
  ) => {
    if (!e || !e.target) return;
    if (e.detail > 1)
      //prevent double click to mess with events, only allows single proper clicks
      return;
    e.preventDefault();

    if (Queue) {
      stopFindingMatch();
      enterQueue(false); //resets button&spinner
      return;
    }
    enterQueue(true);

    try {
      findMatch();
    } catch (e) {
      enterQueue(false);
      toastFailedQueue();
    }
  };

  return (
    <>
      {errorCode && errorCode >= 400 && <FetchError code={errorCode} />}
      <div className="matchmakingPage">
        <Box>
          <Button
            width={[
              "25%", // 0-30em
              "50%", // 30em-48em
              "75%", // 48em-62em
              "100%", // 62em+
            ]}
            alignItems={"center"}
            onClick={startMatching}
          >
            <Box>
              {Queue ? (
                <Text>
                  Finding a worthy challenger... Click again to cancel{" "}
                </Text>
              ) : (
                <Text>Play Pong!</Text>
              )}
            </Box>
          </Button>
        </Box>
        <br></br>
        {Queue && (
          <div className="matchmakingLogos">
            <img
              style={{
                backgroundColor: "transparent",
                alignSelf: "center",
                width: 500,
              }}
              src={MMloading}
              alt="loading..."
            />
          </div>
        )}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <ToastContainer />
      </div>
    </>
  );
}
