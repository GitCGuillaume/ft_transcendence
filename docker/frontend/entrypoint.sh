#!/bin/sh

if [ ! -d ./node_modules ];
then
	npm install -y
	npm install -y react-router-dom
	npm install -y socket.io-client
	npm install -y react-h5-audio-player
fi
exec "$@"
