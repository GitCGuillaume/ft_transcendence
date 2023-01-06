#!/bin/sh
if [ ! -f /var/lib/postgresql/data/postgresql.conf ];
then
	su postgres -c 'initdb'
fi
exec "$@"
