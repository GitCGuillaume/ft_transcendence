FROM debian:bookworm-slim
USER root
LABEL user="gchopin"
LABEL email="gchopin@student.42.fr"
RUN apt-get update -y && apt-get upgrade -y
RUN apt-get install dialog -y && apt-get install libterm-readkey-perl -y && apt-get install -y nginx && apt-get install openssl -y
#man openssl man req
RUN openssl req -newkey rsa:2048 -nodes -days 365 -x509 -keyout /etc/nginx/certificate.key -out /etc/nginx/certificate.crt -subj "/C=FR/ST=FR/L=PARIS/O=GC/OU=GC/CN=GC/"
RUN rm /var/www/html/index.nginx-debian.html;
ENTRYPOINT ["nginx", "-g", "daemon off;"]