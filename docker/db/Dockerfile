FROM postgres:latest
USER root
EXPOSE 5432
volume /var/lib/postgresql/data
COPY entrypoint.sh /usr/bin --chown root
ENTRYPOINT ["/usr/bin/entrypoint.sh"]
#CMD ["sleep", "infinity"]
CMD ["su", "postgres", "-c", "'postgres'"]
