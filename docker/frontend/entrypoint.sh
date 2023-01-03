#!/bin/sh

if [ ! -d ./node_modules ];
then
	npm install -y
	npm install -y react-router-dom
fi
exec "$@"
