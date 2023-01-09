FROM node:19-alpine3.16
USER root
volume	/var/www/html
WORKDIR /var/www/html
COPY entrypoint.sh /home/node --chown root
WORKDIR /var/www/html/front
ENTRYPOINT ["sh", "/home/node/entrypoint.sh"]
CMD ["npm", "run", "dev"]
