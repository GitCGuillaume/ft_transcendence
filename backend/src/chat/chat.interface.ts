export interface InformationChat {
    channel_id: string,
    channel_name: string,
    User_username: string,
    channel_accesstype: string,
}

export interface DbChat {
    id: string,
    name: string,
    user_id: number,
    password: string,
    accesstype: string,
}

export interface Chat {
    id: string,
    name: string,
    owner: number,
    accesstype: string,
    password: string,
    lstMsg: Array<{
        user_id: number,
        username: string
        content: string
    }>,
    lstUsr: Map<number | string, string>,
    lstMute: Map<string, number>,
    lstBan: Map<string, number>,
}

export interface TokenUser {
    userID: number,
    username: string,
    fa: boolean,
    fa_code: string
}