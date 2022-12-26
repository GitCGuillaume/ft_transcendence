FROM node:19-alpine3.16
volume	/var/www/html
WORKDIR /var/www/html
COPY entrypoint.sh /home/node
WORKDIR /var/www/html/my-app
#RUN npx -y create-react-app my-app --template typescript
#ENTRYPOINT ["sleep", "infinity"]
ENTRYPOINT ["sh", "/home/node/entrypoint.sh"]
CMD ["npm", "run", "start"]
