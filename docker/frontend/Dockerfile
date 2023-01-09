FROM node:19-alpine3.16
USER root
volume	/var/www/html
WORKDIR /var/www/html
COPY entrypoint.sh /usr/bin
WORKDIR /var/www/html/front
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["/usr/bin/entrypoint.sh"]
CMD ["npm", "run", "dev"]
