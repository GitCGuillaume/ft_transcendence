FROM node:19-alpine3.16
LABEL user="gchopin"
LABEL mail="gchopin@student.42.fr"
volume	/var/www/html
WORKDIR /var/www/html
RUN npm i -g @nestjs/cli
WORKDIR /var/www/html/test
ENTRYPOINT ["npm", "run", "start:dev"]
