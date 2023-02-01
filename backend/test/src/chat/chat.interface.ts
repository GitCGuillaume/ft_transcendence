export interface InformationChat {
    id: number | string,
    name: string,
    owner: string,
    accessType: string,
}

export interface Chat {
    id: string,
    name: string,
    owner: string,
    accessType: string,
    password: string,
    lstMsg: Array<{
        idUser: string,
        username: string, //à enlever pour un find dans repository
        content: string
    }>,
    lstUsr: Map<number | string, string>,
    lstMute: Map<string, number>,
    lstBan: Map<string, number>,
}