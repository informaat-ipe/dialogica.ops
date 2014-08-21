#!/usr/bin/env bash

arguments=$(cat ${1})

if [ "${arguments}" == "ubuntu" ]; then

    if [ -x ~/thing/bin/node ]; then
        (echo -n '{ "node": "' ; ~/thing/bin/node -v | xargs echo -n ; echo -n '", "npm": "'; (source ~/thing/bin/activate ; ~/thing/bin/npm -v | xargs echo -n) ; echo '" }');
    else
        echo -n '{}'
    fi

else

## Actually this really needs to check the package.json file
node_version=$($(which node) --version)

fi
