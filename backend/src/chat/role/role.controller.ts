import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserDeco } from 'src/common/middleware/user.decorator';
import { TokenUser } from '../chat.interface';
import { PostActionDto, PostActionDtoPsw } from '../dto/role-action-dto';
import { ListUser } from '../lstuser.entity';
import { RoleService } from './role.service';

type typeGetRole = {
    role: string,
    userId: number | undefined
}

@Controller('chat-role')
export class RoleController {
    constructor(private roleService: RoleService) { }

    private async getRole(userId: Readonly<number>,
        channelId: Readonly<string>): Promise<typeGetRole> {
        if (!channelId || !userId)
            return ({ role: "", userId: undefined });
        const list_user: ListUser | null = await this.roleService.getRole(channelId, userId);
        if (!list_user)
            return ({ role: "", userId: undefined });
        return ({ role: list_user.role, userId: list_user.user_id });
    }

    /* GET part */
    /* id = channel's id */
    @Get('getRole')
    async getQueryRole(@UserDeco() user: TokenUser,
        @Query('id') id: string): Promise<typeGetRole> {
        const role: typeGetRole = await this.getRole(user.userID, id);

        return (role);
    }

    @Get('get-role-focus')
    async getQueryFocusRole(@Query('idfocus') userId: number,
        @Query('id') channelId: string): Promise<{ role: string }> {
        if (!channelId || !userId)
            return ({ role: "" });
        const list_user: ListUser | null = await this.roleService.getRole(channelId, userId);
        if (!list_user)
            return ({ role: "" });
        return ({ role: list_user.role });
    }

    /*  grant user to administrator */
    private async grantUser(idFromRequest: Readonly<number>, getRoleRequest: Readonly<typeGetRole>,
        userId: Readonly<number>, id: Readonly<string>, newRole: Readonly<string>) {
        if (getRoleRequest.role === "Owner"
            && Number(getRoleRequest.userId) === idFromRequest) {
            await this.roleService.grantAdminUserWithTransact(id, userId, newRole);
        }
    }

    private banUser(id: Readonly<string>, userId: Readonly<number>,
        time: Readonly<number>, role: Readonly<string>) {
        if (time < 0)
            return;
        if (role === "Administrator" || role === "Owner")
            this.roleService.banUser(id, userId, time);
    }

    private unBanUser(id: Readonly<string>, userId: Readonly<number>,
        role: Readonly<string>) {
        if (role === "Administrator" || role === "Owner") {
            this.roleService.unBanUser(id, userId);
        }
    }

    private unMuteUser(id: Readonly<string>, userId: Readonly<number>,
        role: Readonly<string>) {
        if (role === "Administrator" || role === "Owner") {
            this.roleService.unMuteUser(id, userId);
        }
    }

    private muteUser(id: Readonly<string>, userId: Readonly<number>,
        time: Readonly<number>, role: Readonly<string>) {
        if (time < 0)
            return;
        if (role === "Administrator" || role === "Owner")
            this.roleService.muteUser(id, userId, time);
    }

    private kickUser(id: Readonly<string>, userId: Readonly<number>,
        role: Readonly<string>) {
        if (role === "Administrator" || role === "Owner")
            this.roleService.kickUser(id, userId);
    }

    private setPsw(id: Readonly<string>,
        role: Readonly<string>, psw: Readonly<string>) {
        if (role === "Owner")
            this.roleService.setPsw(id, psw);
    }

    private unSetPsw(id: Readonly<string>,
        role: Readonly<string>) {
        if (role === "Owner")
            this.roleService.unSetPsw(id);
    }

    @Get('get-access-type')
    async getAccessType(@UserDeco() user: TokenUser, @Query('id') id: string) {
        const getRole = await this.getRole(user.userID, id);

        if (getRole.role != "Owner")
            return (false);
        const access = this.roleService.getHasPsw(id);
        return (access);
    }

    /* POST */
    @Post('role-action')
    async runActionAdmin(@UserDeco() user: TokenUser,
        @Body() body: PostActionDto): Promise<boolean> {
        const getRole = await this.getRole(user.userID, body.id);
        const getRoleUserFocus = await this.getRole(body.userId, body.id);
        let action: string = body.action;

        //need to Uppercase first character
        action = action.charAt(0).toUpperCase() + action.slice(1);
        if (!getRoleUserFocus || getRoleUserFocus.role === "Owner")
            return (false);
        if (getRole.role === "Administrator" && getRoleUserFocus.role === "Administrator")
            return (false);
        if (!getRole || user.userID === body.userId
            || (getRole.role !== "Owner" && getRole.role !== "Administrator"))
            return (false);
        switch (action) {
            case "Grant":
                this.grantUser(user.userID, getRole,
                    body.userId, body.id, "Administrator");
                break;
            case "Remove":
                this.grantUser(user.userID, getRole,
                    body.userId, body.id, "");
                break;
            case "Ban":
                this.banUser(body.id, body.userId, Number(body.option), getRole.role);
                break;
            case "Mute":
                this.muteUser(body.id, body.userId, Number(body.option), getRole.role);
                break;
            case "Kick":
                this.kickUser(body.id, body.userId, getRole.role);
                break;
            default:
                break;
        }
        return (true);
    }

    @Post('role-action-spe')
    async runActionAdminSpecial(@UserDeco() user: TokenUser,
        @Body() body: PostActionDto): Promise<boolean> {
        let action: string = body.action;
        const getRole = await this.getRole(user.userID, body.id);
        const getRoleUserFocus = await this.getRole(body.userId, body.id);

        if (!getRole || user.userID === body.userId
            || (getRole.role !== "Owner" && getRole.role !== "Administrator"))
            return (false);
        if (getRole.role === "Administrator" && getRoleUserFocus.role === "Administrator")
            return (false);
        switch (action) {
            case "unban":
                this.unBanUser(body.id, body.userId, getRole.role);
                break;
            case "unmute":
                this.unMuteUser(body.id, body.userId, getRole.role);
                break;
            default:
                break;
        }
        return (true);
    }

    @Post('role-action-psw')
    async runActionAdminPsw(@UserDeco() user: TokenUser,
        @Body() body: PostActionDtoPsw): Promise<boolean> {
        let action: string = body.action;
        const getRole = await this.getRole(user.userID, body.id);

        if (!getRole || getRole.role !== "Owner")
            return (false);
        if (action === "setpsw" && (!body.psw || body.psw === ""))
            return (false);
        switch (action) {
            case "setpsw":
                this.setPsw(body.id, getRole.role, body.psw);
                break;
            case "unsetpsw":
                this.unSetPsw(body.id, getRole.role);
                break;
            default:
                break;
        }
        return (true);
    }
}