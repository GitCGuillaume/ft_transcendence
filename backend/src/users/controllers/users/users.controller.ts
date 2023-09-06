import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe,
    UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, NotFoundException
    , HttpException, HttpStatus, Query, BadRequestException
} from "@nestjs/common";
import { CreateUserDto, BlockUnblock, UpdateUser, Username, FirstConnection, Code } from "src/users/dto/users.dtos";
import { UsersService } from "src/users/providers/users/users.service";
import { CustomAuthGuard } from 'src/auth/auth.guard';
import { JwtGuard, Public } from 'src/auth/jwt.guard';
import { JwtFirstGuard } from 'src/auth/jwt-first.guard';
import { AuthService } from 'src/auth/auth.service';
import { FileInterceptor } from "@nestjs/platform-express";
import { TokenUser } from "src/chat/chat.interface";
import { BlackFriendList } from "src/typeorm/blackFriendList.entity";
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import * as bcrypt from 'bcrypt';
//convert into promise
import { promisify } from "util";
import { unlink, existsSync } from 'fs';
import { UserDeco } from "src/common/middleware/user.decorator";

const sizeOf = promisify(require('image-size'));

@Controller("users")
export class UsersController {
    constructor(private readonly userService: UsersService,
        private authService: AuthService) { }

    @Public()
    @UseGuards(JwtFirstGuard)
    @Get('set-fa')
    async setFa(@UserDeco() user: TokenUser) {
        const userDb = await this.userService.getUserFaSecret(user.userID);

        if (!userDb || !userDb?.username) {
            throw new NotFoundException("Username not found");
        }
        if (userDb.fa === false
            || userDb.secret_fa === null || userDb.secret_fa === "")
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        if (userDb.fa_first_entry === true)
            return ({ code: 3, url: null });
        const otpAuth = authenticator.keyuri(userDb.username, "ft_transcendence", userDb.secret_fa);
        const url = await toDataURL(otpAuth);
        if (url)
            return ({ code: 2, url: url });
        return ({ code: 1, url: null });
    }

    @Public()
    @UseGuards(JwtFirstGuard)
    @Get('check-fa')
    async checkFa(@UserDeco() user: TokenUser) {
        const userDb = await this.userService.getUserFaSecret(user.userID);

        if (!userDb?.username) {
            throw new NotFoundException("Username not found");
        }
        if (userDb.fa === false
            || userDb.secret_fa === null || userDb.secret_fa === "")
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        if (user.fa_code != "")
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    /* get fa code and set it to new jwt token */
    @Public()
    @UseGuards(JwtFirstGuard)
    @Post('valid-fa-code')
    async validFaCode(@Body() body: Code,
        @UserDeco() user: TokenUser) {
        const userDb = await this.userService.getUserFaSecret(user.userID);
        let isValid = false;
        let access_token = { access_token: "" }
        if (!userDb?.username) {
            throw new NotFoundException("Username not found");
        }
        try {
            if (!isNaN(body.code)) {
                //check if code already used, if yes then error
                if (userDb.fa_psw != null) {
                    const ret = await bcrypt.compare(String(body.code), userDb.fa_psw);
                    if (ret === true)
                        return ({ valid: false, username: userDb.username, token: null });
                }
                //check if code is valid with authenticator module
                isValid = authenticator.verify({ token: String(body.code), secret: userDb.secret_fa });
                if (isValid) {
                    user.fa_code = String(body.code);
                    const salt = Number(process.env.SALT);
                    //must hash code into db
                    bcrypt.hash(user.fa_code, salt, ((err, psw) => {
                        if (!err && psw)
                            this.userService.update2FaPsw(user.userID, psw);
                        else
                            throw new NotFoundException("Authenticator code verification failed");
                    }));
                    //register user used a code in db, like this, we can't register again the qr code
                    this.userService.updateFaFirstEntry(user.userID);
                    access_token = await this.authService.login(user);
                    return ({ valid: isValid, username: userDb.username, token: access_token });
                }
                return ({ valid: false, username: userDb.username, token: null });
            }
        } catch (e) {
            throw new BadRequestException("Something went wrong");
        }
        return ({ valid: isValid, username: userDb.username, token: null });
    }

    private async checkUpdateUserError(ret_user: any, ret_user2: any,
        body: any, file: Express.Multer.File | undefined, filePath: string | undefined) {
        let err: string[] = [];
        const regex2 = /^[\w\d]{4,}$/;
        const regexRet2 = regex2.test(body.username);
        let fileDeleted: boolean = false;
        let dimensions;

        if (24 < body.username.length)
            err.push("Username is too long");
        if (body.username.length === 0)
            err.push("Username can't be empty");
        if (body.username.length < 4 && body.username.length != 0)
            err.push("Username is too short");
        //check if username is already used, and if this not the self user
        if (ret_user && ret_user2) {
            if (ret_user2.userID != ret_user.userID)
                if (ret_user.username === body.username)
                    err.push("Username is already used");
        }
        if (regexRet2 === false)
            err.push("Username format is wrong, please use alphabet, numerics values and at least 4 characters");

        if (file)
            dimensions = await sizeOf(file.path);
        if (file && dimensions && filePath
            && typeof dimensions != "undefined"
            && 61 <= dimensions.width) {
            if (existsSync(filePath))
                unlink(filePath, (res) => { if (res) console.log(res) });
            fileDeleted = true
            err.push("Image size width must be below 60px.");
        }
        if (file && filePath
            && dimensions && typeof dimensions != "undefined"
            && 61 <= dimensions.height) {
            if (fileDeleted === false && existsSync(filePath))
                unlink(filePath, (res) => { if (res) console.log(res) });
            err.push("Image size height must be below 60px.");
        }
        return (err);
    }

    @Post('update-user')
    @UseInterceptors(FileInterceptor('fileset', { dest: './upload_avatar' }))
    async updateUser(@UserDeco() user: TokenUser, @UploadedFile(new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 1000000 }),
            new FileTypeValidator({ fileType: /^image\/(png|jpg|jpeg)$/ }),
        ], fileIsRequired: false
    }),
    ) file: Express.Multer.File | undefined, @Body() body: UpdateUser) {
        const ret_user = await this.userService.findUserByName(body.username);
        let ret_user2 = await this.userService.findUsersById(user.userID);
        let filePath: string | undefined = undefined;
        if (file) {
            //shouldn't happen since it's only alphanumeric but still
            const formatFile = file.filename.replace(/[\\./]/g, "");
            filePath = "upload_avatar/" + formatFile;
        }
        //check errors
        let retErr = await this.checkUpdateUserError(ret_user,
            ret_user2, body, file, filePath);

        if (retErr.length != 0)
            return ({ valid: false, err: retErr });
        //update avatar
        if (file && filePath)
            await this.userService.updatePathAvatarUser(user.userID, filePath);
        //need to update username token, for new login
        if (body.username !== "")
            user.username = body.username;
        else if (ret_user2)
            user.username = ret_user2.username;
        //update username
        if (body.username && body.username != "")
            this.userService.updateUsername(user.userID, body.username);
        //check if 2FA is used by requested user
        const regex1 = /^({"fa":true})$/;
        const regexRet = body.fa.match(regex1);
        if (regexRet && ret_user2?.fa === false) {
            //generate new auth secret
            user.fa = true;
            user.fa_code = "";
            this.userService.update2FA(user.userID, true, authenticator.generateSecret());
        }
        else if (!regexRet) {
            user.fa = false;
            user.fa_code = "";
            this.userService.update2FA(user.userID, false, null);
        }
        //need to generate new login token
        const access_token = await this.authService.login(user);
        if (file)
            ret_user2 = await this.userService.findUsersById(user.userID);
        return ({
            valid: true, username: user.username,
            token: access_token, img: ret_user2?.avatarPath
        });
    }

    @Public()
    @UseGuards(JwtFirstGuard)
    @Post('firstlogin')
    @UseInterceptors(FileInterceptor('fileset', { dest: './upload_avatar' }))
    async uploadFirstLogin(@UserDeco() user: TokenUser, @UploadedFile(new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 1000000 }),
            new FileTypeValidator({ fileType: /^image\/(png|jpg|jpeg)$/ }),
        ], fileIsRequired: false
    }),
    ) file: Express.Multer.File | undefined, @Body() body: FirstConnection) {
        const ret_user = await this.userService.getUserProfile(user.userID);
        const ret_user2 = await this.userService.findUserByName(body.username);
        let filePath: string | undefined = undefined;
        if (file) {
            //shouldn't happen since it's only alphanumeric but still
            const formatFile = file.filename.replace(/[\\./]/g, "");
            filePath = "upload_avatar/" + formatFile;
        }
        //check errors
        let retErr = await this.checkUpdateUserError(ret_user2,
            ret_user, body, file, filePath);

        if (retErr.length != 0)
            return ({ valid: false, err: retErr });
        //update avatar
        if (file && filePath)
            this.userService.updatePathAvatarUser(user.userID, filePath);
        this.userService.updateUsername(user.userID, body.username);
        //check if 2FA is asked by requested user
        const regex1 = /^({"fa":true})$/;
        const regexRet = body.fa.match(regex1);
        if (regexRet) {
            //generate new auth secret
            this.userService.update2FA(user.userID, true, authenticator.generateSecret());
            user.fa = true;
            user.fa_code = "";
        }
        user.username = body.username;
        const access_token = await this.authService.login(user);
        return ({ valid: true, username: body.username, token: access_token });
    }

    @UseGuards(JwtGuard)
    @Get('profile')
    async getProfile(@UserDeco() user: TokenUser) {
        const ret_user = await this.userService.getUserProfile(user.userID);
        return (ret_user);
    }

    /* special function, to check username and 2FA for first connection */
    @Public()
    @UseGuards(JwtFirstGuard)
    @Get('first-profile')
    async firstConnectionProfile(@UserDeco() user: TokenUser) {
        const ret_user = await this.userService.getUserProfile(user.userID);
        return (ret_user);
    }

    /* get info focus user with friend and block list from requested user*/
    @Get('info-fr-bl')
    async getUserInfo(@UserDeco() user: TokenUser,
        @Query('name') name: string) {
        const ret_user = await this.userService.findUserByName(name);

        if (!ret_user)
            return ({ valid: false });
        let info = await this.userService.focusUserBlFr(user.userID, Number(ret_user?.userID));
        if (!info) {
            return ({
                valid: true, id: ret_user.userID,
                User_username: ret_user.username, fl: null,
                bl: null
            })
        }
        info.valid = true;
        return (info);
    }

    @Get('fr-bl-list')
    async getFriendBlackListUser(@UserDeco() user: TokenUser) {
        const getBlFr: BlackFriendList[] = await this.userService.getBlackFriendListBy(user.userID)
        return (getBlFr);
    }

    @Get('get-username')
    async getUsername(@UserDeco() user: TokenUser) {
        const ret_user = await this.userService.findUserByName(user.username);
        return (ret_user);
    }

    @Get('get-victory-nb')
    async getNbVictory(@UserDeco() user: TokenUser) {
        const ret_nb = await this.userService.getVictoryNb(user.userID);
        const rankDbByWin = await this.userService.getRankUserGlobalWin(user.userID);
        const rankByRankUser = await this.userService.getRankUserByRank(user.userID);

        return ({ nb: ret_nb, rankDbByWin, rankByRankUser });
    }

    @Get('get-victory-nb-other/:id')
    async getNbVictoryOther(@Param('id', ParseIntPipe) id: number) {
        const ret_nb = await this.userService.getVictoryNb(id);
        const rankDbByWin = await this.userService.getRankUserGlobalWin(id);
        const rankByRankUser = await this.userService.getRankUserByRank(id);

        return ({ nb: ret_nb, rankDbByWin, rankByRankUser });
    }

    @Get('get-games-nb-other/:id')
    async getNbGamesOther(@Param('id', ParseIntPipe) id: number) {
        const ret_nb = await this.userService.getGamesNb(id);
        return (ret_nb);
    }


    @Get('get-games-nb')
    async getNbGames(@UserDeco() user: TokenUser) {
        const ret_nb = await this.userService.getGamesNb(user.userID);
        return (ret_nb);
    }

    @Get('get_raw_mh')
    async getMHRaw(@UserDeco() user: TokenUser) {
        const ret_raw = await this.userService.getRawMH(user.userID);
        return (ret_raw);
    }

    @Get('get_raw_mh_user/:id')
    async getMHRawTwo(@Param('id', ParseIntPipe) id: number) {
        const ret_raw = await this.userService.getRawMH(id);
        return (ret_raw);
    }

    /* 0 = user not found */
    /* 1 = already added in friend list */
    /* 2 = user is self */
    /* 3 = ok */
    @Post('add-friend')
    async addFriend(@UserDeco() user: TokenUser, @Body() body: Username) {
        let err: string[] = [];
        const ret_user = await this.userService.findUserByName(body.username);

        if (!ret_user) {
            err.push("User not found");
            return ({ code: 1, err: err });
        }
        if (ret_user && Number(ret_user.userID) == user.userID)
            err.push("Can't add yourself");
        const findInList = await this.userService.searchUserInList(user.userID, ret_user.userID, 2);
        if (findInList)
            err.push("User aleady in list");
        if (err.length > 0)
            return ({ code: 1, err: err });
        this.userService.insertBlFr(user.userID, Number(ret_user.userID), 2);
        //need to check if user is in BL, for updating global friend black list
        const findInBlackList = await this.userService.searchUserInList(user.userID, ret_user.userID, 1);
        if (findInBlackList) {
            return ({
                code: 3, id: Number(ret_user.userID),
                fl: 2, bl: 1,
                User_username: ret_user.username, User_avatarPath: ret_user.avatarPath
            });
        }
        return ({
            code: 3, id: Number(ret_user.userID),
            fl: 2, bl: 0,
            User_username: ret_user.username, User_avatarPath: ret_user.avatarPath
        });
    }

    /* 0 = user not found */
    /* 1 = already added in friend list */
    /* 2 = user is self */
    /* 3 = ok */
    @Post('add-blacklist')
    async addBlackList(@UserDeco() user: TokenUser, @Body() body: Username) {
        let err: string[] = [];
        const ret_user = await this.userService.findUserByName(body.username);

        if (!ret_user) {
            err.push("User not found");
            return ({ code: 1, err: err });
        }
        if (ret_user && Number(ret_user.userID) == user.userID)
            err.push("Can't add yourself");
        const findInList = await this.userService.searchUserInList(user.userID, ret_user.userID, 1);
        if (findInList)
            err.push("User aleady in list");
        if (err.length > 0)
            return ({ code: 1, err: err });
        this.userService.insertBlFr(user.userID, Number(ret_user.userID), 1);
        //need to check if user is in BL, for updating global friend black list
        const findInBlackList = await this.userService.searchUserInList(user.userID, ret_user.userID, 2);
        if (findInBlackList) {
            return ({
                code: 3, id: Number(ret_user.userID),
                fl: 2, bl: 1,
                User_username: ret_user.username, User_avatarPath: ret_user.avatarPath
            });
        }
        return ({
            code: 3, id: Number(ret_user.userID),
            fl: 2, bl: 0,
            User_username: ret_user.username, User_avatarPath: ret_user.avatarPath
        });
    }

    @Post('fr-bl-list')
    async useBlackFriendList(@UserDeco() user: TokenUser, @Body() body: BlockUnblock) {
        const ret_user = await this.userService.findUsersById(body.userId);
        if (!ret_user)
            return ({ add: false, type: null });
        const find: BlackFriendList | null
            = await this.userService.findBlFr(user.userID, body.userId, body.type);
        if (user.userID === body.userId)
            return ({ add: false, type: null });
        if (find) {
            //deletes
            this.userService.deleteBlFr(find.id);
            return ({ add: false, type: body.type });
        }
        else {
            //insert
            this.userService.insertBlFr(user.userID, body.userId, body.type);
        }
        return ({ add: true, type: body.type });
    }

    /* authguard(strategy name) */
    @Public()
    @UseGuards(CustomAuthGuard)
    @Post('login')
    async login(@UserDeco() user: TokenUser) {
        user.fa_code = "";
        const access_token = await this.authService.login(user);

        return ({
            token: access_token, user_id: user.userID,
            username: user.username, fa: user.fa
        });
    }

    @Post('create')
    @UsePipes(ValidationPipe)
    createUsers(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
    }
    @Get('achiv')
    async achiv(@UserDeco() user: TokenUser) {
        const resAchivement = await this.userService.getAchivementById(user.userID);
        return (resAchivement);
    }

    @Get('achiv-other/:id')
    async achivOther(@Param('id', ParseIntPipe) id: number) {
        const resAchivement = await this.userService.getAchivementById(id);
        return (resAchivement);
    }

    @Get(':id')
    async findUsersById(@Param('id', ParseIntPipe) id: number) {
        const user = await this.userService.findUsersById(id);
        if (!user)
            return ({ userID: 0, username: "", avatarPath: null, sstat: {} });
        return (user)
    }
}