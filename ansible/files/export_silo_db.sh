#!/usr/bin/env bash

# cleanup
find /home/informaat/ipe/server/var/exports/ -name *-automatic -type d -ctime +1 -exec rm -rf \{\} \;

# create new
DB_NAME="IPErelease"
/home/informaat/ipe/server/bin/exportservice_create_script.sh localhost:27017 ${DB_NAME} `date +%s`-automatic
