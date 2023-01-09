#!/bin/sh

dockerize -wait tcp://postgres_tr:5432 -timeout 60s
if [ ! -d ./node_modules ];
then
	npm install
	npm i --save @nestjs/platform-socket.io @nestjs/websockets
	npm i socket.io
	npm install --save @nestjs/typeorm typeorm postgresql
	npm install pg --save
fi
exec "$@"
