#!/bin/sh

if [ ! -d ./node_modules ];
then
	npm install
	./node_modules/.bin/tsc && ./node_modules/.bin/vite -- host
fi
exec "$@"
