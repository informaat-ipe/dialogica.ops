Operations
----------

Ansible
-------

    apt-get install python-yaml python-paramiko python-jinja2 cowsay
    git clone git://github.com/aikomastboom/ansible.git
    export ANSIBLE_HOSTS=./ops/ansible/ansible_hosts
    source ./ansible/hacking/env-setup

Playbooks
---------

scaffold a silo:

    ansible-playbook playbooks/scaffoldsilo.yml


Fleet
-----
installing:

    npm install -g http://github.com/aikomastboom/fleet/archive/0.1.8.tar.gz

running a hub on eg jenkins:

    source ~/thing/bin/activate ; cd ~/fleet; fleet-hub --port 7000 --secret=vier

or

    /usr/bin/screen -dmS fleet /bin/bash -c 'source ~/thing/bin/activate ; npm install -g http://github.com/aikomastboom/fleet/archive/0.1.8.tar.gz ; npm install -g supervisor ; mkdir -p ~/fleet ; cd ~/fleet ; fleet-hub --port 7000 --secret=vier'


runinng a drone on eg silo01 manualy:

    source ~/thing/bin/activate ; cd ~/fleet ; fleet-drone --hub ${fleet_hub} --secret ${fleet_secret}

or using ansible:

    ansible-playbook playbooks/scaffoldsilo.yml

setup your local git repo:

    fleet-remote add default --hub=operations.local:7000 --secret=vier

    git config http.postBuffer 524288000

or add to your ~/.gitconfig

    [http]
          postBuffer = 524288000


deploy to drones:

    fleet-deploy
    fleet-exec -- npm --cache-min 999999 install
    fleet-spawn --env.NODE_ENV=silo -- ./runit


    fleet-deploy ; fleet-exec -- npm --cache-min 999999 install ; fleet-exec -- mv node_modules ../../
    fleet-deploy ; fleet-exec -- ln -s ../../node_modules . ; fleet-spawn --env.NODE_ENV=acc -- ./runit ; fleet-spawn --env.NODE_ENV=silo -- ./runit
    fleet-deploy ; fleet-exec -- ln -s ../../node_modules . ; fleet-exec -- ./testit
