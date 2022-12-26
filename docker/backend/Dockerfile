FROM node:19-alpine3.16
LABEL user="gchopin"
LABEL mail="gchopin@student.42.fr"
volume	/var/www/html
COPY entrypoint.sh /home/node
WORKDIR /var/www/html
RUN npm i -g @nestjs/cli
WORKDIR /var/www/html/test
ENTRYPOINT ["sh", "/home/node/entrypoint.sh"]
CMD ["npm", "run", "start:dev"]
