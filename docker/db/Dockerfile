FROM postgres:latest
USER root
EXPOSE 5432
volume /var/lib/postgresql/data
COPY entrypoint.sh /usr/bin
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["/usr/bin/entrypoint.sh"]
#CMD ["sleep", "infinity"]
CMD ["su", "postgres", "-c", "'postgres'"]
