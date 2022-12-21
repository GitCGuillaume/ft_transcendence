FROM node:19-alpine3.16
LABEL user="gchopin"
LABEL mail="gchopin@student.42.fr"
RUN npm i -g @nestjs/cli
volume	/var/www/html
ENTRYPOINT ["npm", "run", "--prefix", "/var/www/html/test", "start:dev"]
