#!/bin/sh

if [ ! -d ./node_modules ];
then
	npm install
	npm i --save @nestjs/platform-socket.io @nestjs/websockets
	npm i socket.io
fi
exec "$@"
