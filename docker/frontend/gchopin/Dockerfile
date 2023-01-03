FROM node:19-alpine3.16
volume	/var/www/html
WORKDIR /var/www/html
COPY entrypoint.sh /home/node
WORKDIR /var/www/html/front
ENTRYPOINT ["sh", "/home/node/entrypoint.sh"]
CMD ["npm", "run", "dev"]
