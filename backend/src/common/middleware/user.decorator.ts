import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const UserDeco = createParamDecorator((data: unknown, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    return (req.user);
})

export const UserDecoSock = createParamDecorator((data: unknown, context: ExecutionContext) => {
    const req = context.switchToWs().getClient();
    return (req.user);
})