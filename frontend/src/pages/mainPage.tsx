import React, { useContext } from "react";
import "./mainPage.css";
import { LoginButton } from "../components/buttons/buttons";
import UserContext, { UsernameSet } from "../contexts/UserContext";
/* load list user block and friend */
import { LoadUserGlobal } from '../contexts/DisplayChatContext';
import randomstring from 'randomstring';

const client_id = import.meta.env.VITE_APP_ID;
const app_uri = import.meta.env.VITE_APP_URI;
const redirect_uri = app_uri + "/validate";
const state: string = randomstring.generate({charset: 'alphabetic'});
const loginUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=public&state=${state}'`;

function MainPage(props: {
  jwt: string,
  username: string,
  setUsername: React.Dispatch<React.SetStateAction<string>>
}) {
  const userCtx: any = useContext(UserContext);
  if (typeof userCtx.user != "undefined" && userCtx.user.jwt) {
    return (
      <div>
        <UsernameSet jwt={props.jwt}
          username={props.username} setUsername={props.setUsername} />
        <LoadUserGlobal jwt={props.jwt} />
        <img
          src='./transcendence.png'
          srcSet='./transcendence_3.png 101w, ./transcendence_2.png 203w, ./transcendence.png 406w,'
          alt="transcendence picture"
          className='transcendence'
        />
        <div>Hello</div>
      </div>
    )
  }
  return (
    <div className="splash_middle">
      <img className='transcendence'
        src='./transcendence.png'
        srcSet='./transcendence_3.png 101w, ./transcendence_2.png 203w, ./transcendence.png 406w,'
        alt="transcendence picture"
      />
      <div className="splash_content">
        <LoginButton url={loginUrl} />
      </div>
    </div>
  );
}

export default MainPage;
