#!/bin/sh
if [ ! -f /var/lib/postgresql/data/postgresql.conf ];
then
	su postgres -c 'initdb';
fi
su postgres -c 'pg_ctl start';
psql -U postgres -c "CREATE USER gchopin WITH PASSWORD 'testpass';";
psql -u postgres -c "GRANT ALL PRIVILEGES ON DATABASE 'postgres to gchopin;'";
echo "# TYPE DATABASE USER CIDR-ADDRESS  METHOD
host  all  all 0.0.0.0/0 md5" >> /var/lib/postgresql/data/pg_hba.conf;
#ne pas mettre en dur, juste pour lancer une premiere fois le container
su postgres -c 'pg_ctl stop';
exec "$@"
