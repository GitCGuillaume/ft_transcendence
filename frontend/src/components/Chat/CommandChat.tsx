import { typeListUser, typeListUserGlobal, updateBlackFriendList } from "../../contexts/DisplayChatContext";
import { NavigateFunction } from "react-router-dom";
import { playPageInvite } from "../../pages/PlayInvite";
import { header, headerPost } from "../FetchError";

type typeUserInfo = {
    User_username: string,
    id: number,
    fl: number | null,
    bl: number | null,
    avatarPath: string | null
}

type typeFetchToBack = {
    channelId: string,
    action: string,
    jwt: string,
    userId: number,
    option: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>
}

type typeFetchToBackPsw = {
    channelId: string,
    action: string,
    jwt: string,
    psw: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>
}


const fetchToBackWithTimer = (elem: typeFetchToBack) => {
    fetch('https://' + location.host + '/api/chat-role/role-action', {
        method: 'post',
        headers: headerPost(elem.jwt),
        body: JSON.stringify({
            id: elem.channelId, action: elem.action,
            option: elem.option, userId: elem.userId
        })
    })
        .then(res => {
            if (res && res.ok)
                return (res);
            if (res)
                elem.setErrorCode(res.status);
        })
        .catch(e => console.log(e));
}

const fetchToBackSpecial = (elem: typeFetchToBack) => {
    fetch('https://' + location.host + '/api/chat-role/role-action-spe', {
        method: 'post',
        headers: headerPost(elem.jwt),
        body: JSON.stringify({
            id: elem.channelId, action: elem.action,
            option: elem.option, userId: elem.userId
        })
    })
        .then(res => {
            if (res && res.ok)
                return (res);
            if (res)
                elem.setErrorCode(res.status);
        })
        .catch(e => console.log(e));
}

const fetchToBackPsw = (elem: typeFetchToBackPsw) => {
    fetch('https://' + location.host + '/api/chat-role/role-action-psw', {
        method: 'post',
        headers: headerPost(elem.jwt),
        body: JSON.stringify({
            id: elem.channelId, action: elem.action,
            psw: elem.psw
        })
    })
        .then(res => {
            if (res && res.ok)
                return (res);
            if (res)
                elem.setErrorCode(res.status);
        })
        .catch(e => console.log(e));
}

const getUserInfoByName = (jwt: string, username: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    id: string, firstPartCmd: string, thirdPart: string) => {
    fetch('https://' + location.host + '/api/users/info-fr-bl?' + new URLSearchParams({
        name: username
    }), { headers: header(jwt) })
        .then(res => {
            if (res && res.ok)
                return (res.json());
            if (res && res.status)
                setErrorCode(res.status)
        }).then(res => {
            if (res && res.valid === true &&
                (firstPartCmd === "unban" || firstPartCmd === "unmute")) {
                fetchToBackSpecial({
                    channelId: id,
                    action: firstPartCmd, jwt: jwt,
                    userId: Number(res.id), option: thirdPart,
                    setErrorCode
                });
            }
            else if (res && res.valid === true) {
                fetchToBackWithTimer({
                    channelId: id,
                    action: firstPartCmd, jwt: jwt,
                    userId: Number(res.id), option: thirdPart,
                    setErrorCode
                });
            }
        }).catch(err => console.log(err));
}

const isCmdValid = (cmd: string, length: number) => {
    const arrBasicUser = [
        "block", "unblock", "friend", "unfriend", "invite",
        "profile"
    ]
    /* setpsw = updatepsw */
    const arrAdminUser = [
        "grant", "ungrant", "ban",
        "unban", "mute", "unmute", "kick",
        "setpsw"
    ]

    for (let i = 0; i < arrBasicUser.length; ++i) {
        if (arrBasicUser[i] === cmd) {
            if (length != 2)
                return ({ valid: false, type: "" });
            return ({ valid: true, type: "user" });
        }
    }
    for (let i = 0; i < arrAdminUser.length; ++i) {
        if (arrAdminUser[i] === cmd) {
            if ((cmd === "grant" || cmd === "kick"
                || cmd === "unban" || cmd === "unmute"
                || cmd === "setpsw")
                && length != 2)
                return ({ valid: false, type: "" });
            else if ((cmd === "ban" || cmd === "mute") && length != 3)
                return ({ valid: false, type: "" });
            return ({ valid: true, type: "admin" });
        }
    }
    return ({ valid: false, type: "" });
}

/* we take lstuserchat because we might need to update channel page part
    we also import lstuserglobal, because we can't use react hook in non componant react function
*/

const fetchBlackAndFriendList = (userInfo: typeUserInfo, jwt: string,
    type: number, setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    //explicit function in parameter
    updateUserInfo: {
        (username: string, id: number, friend: number | null,
            block: number | null, avatarPath: string | null):
            void; (arg0: string, arg1: number, arg2: number | null,
                arg3: number | null, arg4: string | null): void;
    }) => {
    fetch("https://" + location.host + "/api/users/fr-bl-list", {
        method: 'post',
        headers: headerPost(jwt),
        body: JSON.stringify({
            userId: Number(userInfo.id), type: type
        })
    }).then(res => {
        if (res && res.ok)
            return (res.json());
        if (res)
            setErrorCode(res.status);
    }).then((res: { add: boolean, type: number }) => {
        if (res) {
            if (res.add) {
                if (res.type === 1) {
                    updateUserInfo(userInfo.User_username, Number(userInfo.id),
                        userInfo.fl, res.type, userInfo.avatarPath);
                } else if (res.type === 2) {
                    updateUserInfo(userInfo.User_username, Number(userInfo.id),
                        res.type, userInfo.bl, userInfo.avatarPath);
                }
            } else {
                if (res.type === 1) {
                    updateUserInfo(userInfo.User_username, Number(userInfo.id),
                        userInfo.fl, null, userInfo.avatarPath);
                } else if (res.type === 2) {
                    updateUserInfo(userInfo.User_username, Number(userInfo.id),
                        null, userInfo.bl, userInfo.avatarPath);
                }
            }
        }
    }).catch(e => console.log(e));
}

export const commandChat = (jwt: string, obj: any,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    lstUserGlobal: typeListUserGlobal["listUser"], lstUserChat: typeListUser["listUser"],
    setLstUserGlobal: React.Dispatch<React.SetStateAction<typeListUserGlobal["listUser"]>>,
    setLstUserChat: React.Dispatch<React.SetStateAction<typeListUser["listUser"]>>,
    navigate: NavigateFunction) => {
    const cmd = obj.content;

    const listHandle = (jwt: string,
        setErrorCode: React.Dispatch<React.SetStateAction<number>>,
        type: number, userInfo: typeUserInfo): void => {

        function updateUserInfo(username: string, id: number,
            friend: number | null, block: number | null, avatarPath: string | null) {
            updateBlackFriendList({
                id: id,
                fl: friend, bl: block,
                User_username: username, User_avatarPath: avatarPath
            }, lstUserGlobal, setLstUserGlobal);
            if (lstUserChat.length > 0) {
                const find = lstUserChat.find(elem => Number(elem.list_user_user_id) === id);
                if (find) {
                    const newArr = lstUserChat.map((value) => {
                        if (value && Number(value.list_user_user_id) === id) {
                            value.bl = block;
                            value.fl = friend;
                        }
                        return (value);
                    });
                    setLstUserChat(newArr);
                }
            }
        }
        fetchBlackAndFriendList(userInfo, jwt, type, setErrorCode, updateUserInfo);
    }

    function runUserCmd(jwt: string, firstPartCmd: string, secondPartCmd: string) {
        function getInfoUser(jwt: string, firstPartCmd: string, secondPartCmd: string,
            setErrorCode: React.Dispatch<React.SetStateAction<number>>) {
            fetch('https://' + location.host + '/api/users/info-fr-bl?' + new URLSearchParams({
                name: secondPartCmd
            }), { headers: header(jwt) })
                .then(res => {
                    if (res && res.ok)
                        return (res.json());
                    if (res)
                        setErrorCode(res.status)
                })
                .then((res: any) => {
                    if (res && res.valid) {
                        if (firstPartCmd === "profile") {
                            navigate({ pathname: "/profile/" + res.id });
                            return;
                        }
                        if (firstPartCmd === "invite") {
                            playPageInvite(jwt, setErrorCode,
                                Number(res.id), navigate);
                            return;
                        }
                        if ((firstPartCmd === "block" && res.bl === null)
                            || (firstPartCmd === "unblock" && res.bl === 1)) {
                            listHandle(jwt, setErrorCode, 1, res);
                        }
                        else if ((firstPartCmd === "friend" && res.fl === null)
                            || (firstPartCmd === "unfriend" && res.fl === 2)) {
                            listHandle(jwt, setErrorCode, 2, res);
                        }
                    }
                }).catch(e => console.log(e));
        }
        //get user info from db
        getInfoUser(jwt, firstPartCmd, secondPartCmd,
            setErrorCode);
    }

    function runAdminCmd(jwt: string, firstPartCmd: string, secondPartCmd: string, thirdPart: string) {
        fetch('https://' + location.host + '/api/chat-role/getRole?' + new URLSearchParams({
            id: obj.id,
        }), { headers: header(jwt) })
            .then(res => {
                if (res && res.ok)
                    return (res.json());
                if (res)
                    setErrorCode(res.status);
            })
            .then((res) => {
                if (res && res.role) {
                    if (firstPartCmd !== "setpsw" && firstPartCmd !== "unsetpsw")
                        getUserInfoByName(jwt, secondPartCmd, setErrorCode,
                            obj.id, firstPartCmd, thirdPart);
                    else {
                        fetchToBackPsw({
                            channelId: obj.id,
                            action: firstPartCmd, jwt: jwt,
                            psw: secondPartCmd,
                            setErrorCode
                        })
                    }
                }
            }).catch(e => console.log(e));
        return (true);
    }

    if (cmd && cmd[0] != '/')
        return (false);
    const split = cmd.split(" ");
    //parse cmd
    const firstPartCmd = split[0].replace('/', '');
    const secondPartCmd = split[1];
    //check command validation
    if (firstPartCmd === "unsetpsw") {
        runAdminCmd(jwt, firstPartCmd, firstPartCmd, "");
    } else {
        const result = isCmdValid(firstPartCmd, split.length);
        if (result.valid === false)
            return (false);
        if (result.type === "user") {
            //run user commands
            runUserCmd(jwt, firstPartCmd, secondPartCmd);
        } else if (result.type === "admin") {
            //run administator commands
            runAdminCmd(jwt, firstPartCmd, secondPartCmd, split[2]);
        }
    }
    return (true);
}