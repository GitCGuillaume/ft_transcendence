import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
  Query,
  Param,
} from "@nestjs/common";
import { TokenUser } from "src/chat/chat.interface";
import { UserDeco, UserDecoSock } from "src/common/middleware/user.decorator";
import { CreateRoomDto, CreateRoomInvite, ParamRoom } from "src/rooms/dto/rooms.dtos";
import { RoomsService } from "src/rooms/services/rooms/rooms.service";
import { SocketEvents } from "src/socket/socketEvents";
import { UsersService } from "src/users/providers/users/users.service";

@Controller("rooms")
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly socketEvents: SocketEvents,
    private readonly userService: UsersService
  ) { }

  @Post("create")
  @UsePipes(ValidationPipe)
  createRoom(@UserDeco() user: TokenUser,
    @Body() createRoomDto: CreateRoomDto) {
    const regex = /^[\wàâéêèäÉÊÈÇç]+(?: [\wàâéêèäÉÊÈÇç]+)*$/;
    const resultRegex = regex.exec(createRoomDto.roomName);

    if (24 < createRoomDto.roomName.length) {
      return { err: "true", uid: "" }
    }
    if (!resultRegex) {
      return { err: "true", uid: "" }
    }
    const userId = user.userID;
    for (let [key, value] of this.socketEvents.getMap().entries()) {
      if (value === userId) {
        return { err: "You are already in a party", uid: "" }
      }
    }
    let settings = {
      powerUps: false,
      type: "Classic",
      goal: 11,
      speed: 5,
      acceleration: 0.1,
      ballSize: 10,
      ballColor: "WHITE",
    };

    createRoomDto.settings = settings;
    return this.roomsService.createRoom(createRoomDto);
  }

  @Post("create-private")
  @UsePipes(ValidationPipe)
  async createRoomPrivate(@UserDecoSock() user: TokenUser,
    @Body() createRoomDto: CreateRoomInvite
  ) {
    const name: string = String(user.userID) + "|" + String(createRoomDto.id);
    if (user.userID === createRoomDto.id) {
      return { roomName: "", Capacity: "0", private: false, uid: "" };
    }
    const userExist = await this.userService.findUsersById(createRoomDto.id);
    if (!userExist)
      return { roomName: "", Capacity: "0", private: false, uid: "" };
    const isUserConnected = this.socketEvents.isUserConnected(
      String(createRoomDto.id)
    );
    if (!isUserConnected)
      return { roomName: "", Capacity: "0", private: false, uid: "" };
    const userId = user.userID;
    for (let [key, value] of this.socketEvents.getMap().entries()) {
      if (value === userId || value === createRoomDto.id) {
        return { roomName: "", Capacity: "0", private: false, uid: "" };
      }
    }
    const itm = await this.roomsService.createRoomPrivate(name);
    this.socketEvents.inviteUserToGame(
      String(user.userID),
      String(createRoomDto.id),
      itm.uid
    );
    return itm;
  }

  @Get("get")
  async getRoom(@Query("id") id: string) {
    const room = await this.roomsService.getRoom(id);

    if (!room) return { exist: false };
    return { exist: true };
  }

  @Get()
  getRooms() {
    return this.roomsService.getRooms();
  }

  @Get(":id")
  async getRoomById(@Param() params: ParamRoom, @UserDeco() user: TokenUser) {
    const isUserConnected = this.socketEvents.isUserConnected(
      String(user.userID)
    );
    if (!isUserConnected)
      return { roomName: "", Capacity: "0", private: false, uid: "" };
    return this.roomsService.findRoomById(params.id);
  }
}
