import { IsString, IsInt } from 'class-validator';

export interface Chat {
    id: string,
    name: string,
    owner: number,
    accessType: string,
    password: string,
    lstMsg: Array<{
        avatarUrl: string,
        id: number | string,
        username: string,
        content: string
    }>,
    lstUsr: Array<{
        avatarUrl: string,
        id: number | string,
        username: string,
        content: string
    }>,
    lstMute: Map<string, number>,
    lstBan: Map<string, number>,
}
