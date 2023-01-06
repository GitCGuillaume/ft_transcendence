FROM postgres:latest
EXPOSE 5432
volume /var/lib/postgresql/data
COPY entrypoint.sh /home
ENTRYPOINT ["sh", "/home/entrypoint.sh"]
CMD ["su", "postgres", "-c", "'postgres'"]
