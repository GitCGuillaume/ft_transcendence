FROM postgres:latest
USER root
EXPOSE 5432
volume /var/lib/postgresql/data
COPY entrypoint.sh /home
ENTRYPOINT ["sh", "/home/entrypoint.sh"]
#CMD ["sleep", "infinity"]
CMD ["su", "postgres", "-c", "'postgres'"]
