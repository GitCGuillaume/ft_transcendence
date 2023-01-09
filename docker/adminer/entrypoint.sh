#!/bin/sh
mkdir -p /var/www/html/adminer
mv /tmp/adminer-4.8.1-en.php /var/www/html/adminer/index.php
chown -R www-data /var/www/html/adminer
chgrp -R www-data /var/www/html/adminer
nginx &
exec "$@"
