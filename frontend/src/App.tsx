import React, { useState, useContext, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import io, { Socket } from 'socket.io-client';

import LoginPage from "./pages/login";
import Logout from "./pages/Logout";
import MainPage from "./pages/mainPage";
import ValidatePage from "./pages/validate";
import PlayerApp from "./components/PlayerApp";

/* load list user block and friend */
import { LoadUserGlobal } from './contexts/DisplayChatContext';

/* NavBar */
import NavBar from './components/navbar/NavBar';

/*channel part */
import ListChannel from "./components/Chat/ListChannel";
import Chat from "./components/Chat/Chat";
import UnfoldDirectMessage from "./components/Chat/DirectMessage";

/* User profile part */
import Setting from "./pages/User/Setting";
import FriendList from "./pages/User/FriendList";
import BlackList from "./pages/User/BlackList";
import FirstConnectionPage from "./components/Users/FirstConnectionPage";

/* FA */
import SettingFa from './components/Users/Fa'

import PlayPage from "./pages/play";
import MatchmakingPage from "./pages/matchmaking";
import { SocketProvider } from './contexts/Socket';
import { DisplayChatGlobalProvider } from "./contexts/DisplayChatContext";
import UserContext, { UsernameSet } from "./contexts/UserContext";
import { useLocation } from 'react-router-dom';
import FaCode from "./components/Users/FaCode";
import UserProfileOther from "./pages/User/UserProfileOther";
import PlayPageInvite from "./pages/PlayInvite";

/* import css */
import "./App.css";
import "./css/inviteGame.css";
import PlayPageMatchmaking from "./pages/PlayMatchmaking";

const ErrorPage = () => {
  const location = useLocation();
  if (location.state === null)
    return (<div>Error 404</div>);
  else if (location.state.code === 9999)
    return (<div>Error, something went wrong with the server, please contact administrator.</div>);
  return (<div>Error {location.state.code}</div>);
}

function App() {
  const [click, setClick] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const userCtx: any = useContext(UserContext);
  const [usrSocket, setUsrSocket] = useState<Socket<any, any> | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  let jwt = userCtx.getJwt();

  useEffect(() => {
    if (!jwt && usrSocket?.connected === true)
      usrSocket.disconnect();
    if (jwt) {
      if (usrSocket?.connected === true)
        usrSocket.disconnect();
      new Promise((resolve) => {
        resolve(setUsrSocket(undefined));
      }).then(() => {
        setUsrSocket(io("https://" + location.host, {
          withCredentials: true,
          extraHeaders: {
            authorization: jwt
          },
          autoConnect: true,
          secure: true,
        }));
      }).catch((res) => {
        setLoading(true);
        console.log(res);
      });
    }
    setLoading(false);
    return (() => {
      usrSocket?.disconnect();
      setUsrSocket(undefined);
    });
  }, [jwt]);

  return (
    <>
      {loading === true && <div>Content is loading...</div>}
      {loading === false &&
        <SocketProvider jwt={jwt} usrSocket={usrSocket}>
          <DisplayChatGlobalProvider jwt={jwt} usrSocket={usrSocket} >
            <Routes>
              <Route path="/" element={
                <>{jwt && jwt != "" && <UnfoldDirectMessage
                  width={600} height={280} opacity={1} jwt={jwt} />}
                  <NavBar click={click} setClick={setClick} />
                  <MainPage jwt={jwt} username={username} setUsername={setUsername} /><PlayerApp />
                </>} />
              <Route path="/first-connection" element={
                <>
                  <FirstConnectionPage jwt={jwt} /><PlayerApp />
                </>} />
              <Route path="/fa-activate" element={
                <>
                  <SettingFa jwt={jwt} />
                </>
              } />
              <Route path="/fa-code" element={
                <>
                  <FaCode jwt={jwt} />
                </>
              } />
              <Route path="/profile" element={
                <>
                  <NavBar click={click} setClick={setClick} />
                  <Setting jwt={jwt} /><PlayerApp />
                </>
              } />
              <Route path="/profile/:id" element={
                <>
                  <UsernameSet jwt={jwt} username={username} setUsername={setUsername} />
                  <LoadUserGlobal jwt={jwt} />
                  {jwt && jwt != "" && <UnfoldDirectMessage
                    width={600} height={280} opacity={1} jwt={jwt} />}
                  <NavBar click={click} setClick={setClick} />
                  <UserProfileOther jwt={jwt} /><PlayerApp />
                </>
              } />
              <Route path="/friendList" element={
                <>
                  <UsernameSet jwt={jwt} username={username} setUsername={setUsername} />
                  <LoadUserGlobal jwt={jwt} />
                  {jwt && jwt != "" && <UnfoldDirectMessage
                    width={600} height={280} opacity={1} jwt={jwt} />}
                  <NavBar click={click} setClick={setClick} />
                  <FriendList jwt={jwt} /><PlayerApp />
                </>} />
              <Route path="/blackList" element={
                <>
                  <UsernameSet jwt={jwt} username={username} setUsername={setUsername} />
                  <LoadUserGlobal jwt={jwt} />
                  {jwt && jwt != "" && <UnfoldDirectMessage
                    width={600} height={280} opacity={1} jwt={jwt} />}
                  <NavBar click={click} setClick={setClick} />
                  <BlackList jwt={jwt} /><PlayerApp />
                </>
              } />
              <Route path="/login" element={
                <>
                  <NavBar click={click} setClick={setClick} />
                  <LoginPage jwt={jwt} /><PlayerApp />
                </>
              } />
              <Route path="/logout" element={<Logout
                usrSocket={usrSocket} setUsrSocket={setUsrSocket} />} />
              <Route path="/validate" element={
                <>{jwt && jwt != "" && <UnfoldDirectMessage
                  width={600} height={280} opacity={1} jwt={jwt} />}
                  <NavBar click={click} setClick={setClick} />
                  <ValidatePage jwt={jwt} />
                  <PlayerApp />
                </>
              } />
              <Route path="/channels" element={
                <>
                  <UsernameSet jwt={jwt} username={username} setUsername={setUsername} />
                  <LoadUserGlobal jwt={jwt} />
                  {jwt && jwt != "" && <UnfoldDirectMessage
                    width={600} height={280} opacity={1} jwt={jwt} />}
                  <NavBar click={click} setClick={setClick} />
                  <ListChannel jwt={jwt} /><PlayerApp />
                </>
              }>
                <Route path=":id" element={<Chat jwt={jwt} />} />
              </Route>
              <Route path="/play" element={
                <>
                  <UsernameSet jwt={jwt} username={username} setUsername={setUsername} />
                  <LoadUserGlobal jwt={jwt} />
                  {jwt && jwt != "" && <UnfoldDirectMessage
                    width={600} height={280} opacity={1} jwt={jwt} />}
                  <NavBar click={click} setClick={setClick} />
                  <PlayPage jwt={jwt} /><PlayerApp />
                </>
              } />
              <Route path="/play-invite/:id" element={
                <>
                  <UsernameSet jwt={jwt} username={username} setUsername={setUsername} />
                  <LoadUserGlobal jwt={jwt} />
                  {jwt && jwt != "" && <UnfoldDirectMessage
                    width={600} height={280} opacity={1} jwt={jwt} />}
                  <NavBar click={click} setClick={setClick} />
                  <PlayPageInvite jwt={jwt} /><PlayerApp />
                </>
              } />
              <Route path="/play-matchmaking/:id" element={
                <>
                  <UsernameSet jwt={jwt} username={username} setUsername={setUsername} />
                  <LoadUserGlobal jwt={jwt} />
                  {jwt && jwt != "" && <UnfoldDirectMessage
                    width={600} height={280} opacity={1} jwt={jwt} />}
                  <NavBar click={click} setClick={setClick} />
                  <PlayPageMatchmaking jwt={jwt} /><PlayerApp />
                </>
              } />
              <Route path="/matchmaking" element={
                <>
                  <UsernameSet jwt={jwt} username={username} setUsername={setUsername} />
                  <LoadUserGlobal jwt={jwt} />
                  {jwt && jwt != "" && <UnfoldDirectMessage
                    width={600} height={280} opacity={1} jwt={jwt} />}
                  <NavBar click={click} setClick={setClick} />
                  <MatchmakingPage /><PlayerApp />
                </>
              } />
              <Route path="/error-page" element={<><NavBar click={click} setClick={setClick} /><ErrorPage /></>} />
              <Route path="*" element={<><ErrorPage /></>} />
            </Routes>
          </DisplayChatGlobalProvider>
        </SocketProvider>
      }
    </>
  );
}

export default App;
