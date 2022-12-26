FROM node:19-alpine3.16
volume	/var/www/html
WORKDIR /var/www/html
#RUN npx -y create-react-app my-app --template typescript
#ENTRYPOINT ["sleep", "infinity"]
ENTRYPOINT ["npm", "--prefix", "./my-app", "run", "start"]
