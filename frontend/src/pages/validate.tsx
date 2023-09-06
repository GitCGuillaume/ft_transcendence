import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext } from "react";
import UserContext from "../contexts/UserContext";
import { FetchError } from "../components/FetchError";

const CheckFa = (props: { userCtx: any, fa: boolean | undefined }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (props.userCtx.getUsername() == "")
      navigate('/first-connection');
    else if (props.fa === true)
      navigate('/fa-code');
    else
      navigate('/');
  }, []);
  return (
    <></>
  );
}

function ValidatePage(props: { jwt: string }) {
  const userCtx: any = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const [errorCode, setErrorCode] = useState<number>(200);
  const [fa, setFa] = useState<boolean | undefined>(undefined);
  //ask load user
  useEffect(() => {
    const getUser = (code: string | null | false) => {
      return (fetch('https://' + location.host + '/api/users/login', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code
        })
      }).then(response => {
        if (response && response.ok)
          return (response.json());
        if (response)
          setErrorCode(response.status);
      }));
    };
    //set load user
    getUser(code).then(res => {
      if (typeof res != "undefined") {
        setFa(res.fa);
        userCtx.loginUser({
          jwt: res.token.access_token,
          username: res.username,
          userId: String(res.user_id)
        });
      }
    }).catch(e => console.log(e));
  }, []);

  if (errorCode >= 400)
    return (<FetchError code={errorCode} />);
  return (
    <div>
      <h1>Logged as</h1>
      {props.jwt && <CheckFa userCtx={userCtx} fa={fa} />}
    </div>
  );
}

export default ValidatePage;