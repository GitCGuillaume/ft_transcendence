FROM node:current-alpine3.16
USER root
WORKDIR /var/www/html
COPY entrypoint.sh /usr/bin
WORKDIR /var/www/html
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["/usr/bin/entrypoint.sh"]
CMD ["npm", "run", "dev"]
