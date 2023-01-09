FROM node:19-alpine3.16
USER root
volume	/var/www/html
WORKDIR /var/www/html
COPY entrypoint.sh /usr/bin --chown root
WORKDIR /var/www/html/front
ENTRYPOINT ["/usr/bin/entrypoint.sh"]
CMD ["npm", "run", "dev"]
