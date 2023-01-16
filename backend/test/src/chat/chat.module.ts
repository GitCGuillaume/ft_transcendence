import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';7
import { ChatController } from './chat.controller';

@Module({
    providers: [ChatGateway, ChatService],
    exports: [ChatService, ChatGateway],
    controllers: [ChatController]
})
export class ChatModule {}
