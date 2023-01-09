FROM node:19-alpine3.16
LABEL user="gchopin"
LABEL mail="gchopin@student.42.fr"
volume	/var/www/html
COPY entrypoint.sh /home/node
WORKDIR /var/www/html
RUN npm i -g @nestjs/cli
WORKDIR /var/www/html/test
ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz
ENTRYPOINT ["sh", "/home/node/entrypoint.sh"]
CMD ["npm", "run", "start:dev"]
