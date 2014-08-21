# Joyent install
First make sure you have the joyent tool installed:

	npm install -g smartdc

Register your ssh key with joyent, but make sure you have a copy of
your keys with a descriptive name, or have generated a new set of keys
for this purpose, or you will make a mess of the keys registered on
joyent already.

	cd ~/.ssh
	cp id_rsa.pub id_rsa.myname.joyent.pub
	cp id_rsa id_rsa.myname.joyent

Now register the key, either by going to the joyent website and doing
it there, or using the smartdc tool.

	smartdc setup 

Follow the prompts, but for both you have to know the joyent login/password

Next you have to set up environment variables that take care of going to the right place etc.

	export SDC_CLI_URL=https://eu-ams-1.api.joyentcloud.com
	export SDC_CLI_ACCOUNT=informaat
	export SDC_CLI_KEY_ID=id_rsa.rohan.joyent
	export SDC_CLI_IDENTITY=/Users/rohann/.ssh/id_rsa.rohan.joyent
	
Now when you use the sdc it goes to the right datacenter, and your credentials are all in place.

This is a general ansible thing, but you want to be using the correct ansible hosts file

	export ANSIBLE_HOSTS=~/informaat/ipe/ops/ansible/ansible_hosts


## Smartos image and package

This is the image we are going to be using. (sdc-listimages to get the full list)

	{
		"id": "1fc068b0-13b0-11e2-9f4e-2f3f6a96d9bc",
		"urn": "sdc:sdc:nodejs:1.4.0",
		"name": "nodejs",
		"os": "smartos",
		"type": "smartmachine",
		"description": "A SmartOS image with Node.js, npm, MongoDB and other useful packages pre-installed. Ideal for Node.js applications.",
		"default": false,
		"requirements": {},
		"version": "1.4.0",
		"created": "2012-10-11T14:41:52+00:00"
	}

This is the package we will be using (sdc-listpackages to get the full list): 

	{
		"name": "Extra Small 512 MB",
		"memory": 512,
		"disk": 15360,
		"vcpus": 1,
		"swap": 1024,
		"default": false
	}
	
## Creating a machine

With the image and package decided on, it is time to create the image:

	$ sdc-createmachine --name silotest --dataset "sdc:sdc:nodejs:1.4.0" \
	--package "Extra Small 512 MB" --metadata creator="Rohan Nicholls" \
	--metadata email="rohan.nicholls@informaat.nl" 

And this will return something like this:

	{
		"id": "8d787a60-95a3-4651-95df-52ec313a09a0",
		"name": "silotest",
		"type": "smartmachine",
		"state": "provisioning",
		"dataset": "sdc:sdc:nodejs:1.4.0",
		"ips": [
			"37.153.98.233",
			"10.224.6.199"
		],
		"memory": 512,
		"disk": 15360,
		"metadata": {
			"creator": "Rohan Nicholls",
			"email": "rohan.nicholls@informaat.nl",
			"credentials": {
				"root": "qndCBF.C9=",
				"admin": "E+Q7cDdg^6",
				"mongodb": "f+ua%wyg+="
			}
		},
		"created": "2013-02-18T13:15:21+00:00",
		"updated": "2013-02-18T13:15:22+00:00",
		"primaryIp": "37.153.98.233"
	}

## Getting access to the machine

First you need to see if the things is actually running.  You need the
id you were just returned from creating the machine:

	sdc-getmachine "8d787a60-95a3-4651-95df-52ec313a09a0"

And this will return the same as the above, but you are interested in the "state":

	{
		"id": "8d787a60-95a3-4651-95df-52ec313a09a0",
		"name": "silotest",
		"type": "smartmachine",
		"state": "running",
		"dataset": "sdc:sdc:nodejs:1.4.0",
		"ips": [
			"37.153.98.233",
			"10.224.6.199"
		],
		"memory": 512,
		"disk": 15360
		...
	}

Now to ssh into the machine.  First you need to add the certificate
that you are using with joyent to the agent. As this should have a
different name to your default you will want to add it specifically.

	ssh-add ~/.ssh/id_rsa.myname.joyent

Assuming you have two ips as above, take the one that does not begin
with 10, and ssh into the machine.  If this hangs try the other ipe
address.

	ssh -A admin@37.153.98.233

And you should be in.  Now you can start provisioning the server.  For
our silo we want a couple of things to allow us to get on with
business.  The first problem is that we need something that allows us
to have multiple nodejs versions on the machine, so when upgrading we
can build the latest source with the version it needs and then switch
over when the build is known to work.  For this we will be using
nodeenv.

Just a note: the admin user has nopasswd sudo access, so consider it
root.  We will want to make a user that runs things.

	sudo useradd informaat 

So, what do we get with our image, out of the box?

 - the smartos equivalent of build-essential
 - nodejs 0.8.11
 - npm 1.1.62
 - git
 - python 2.7
 
Missing : 
 - we need to be specific with the version of nodejs we want.
 (- easy_install 
 - nodeenv) These are actually not needed, according to the new compile 
 
Useful joyent specific tools:
	
	sudo pkgin install smtools

Installing nodeenv:

	sudo pkgin install  py27-setuptools-0.6c11nb1
	sudo easy_install-2.7 nodeenv

### Keeping nodejs versions current

At the moment we are going for simple as possible, which means that
the nodeenv solution is being put on ice, and we are going to use the
global nodejs as *the* nodejs used by our system.  Luckily the nodejs
versions available on the joyent servers will be more up to date than
that used by our code.

Using pkgin you can see what we have and what is available.

	sudo pkgin update
	sudo pkgin search nodejs
	
This will give output much like this:

     pkg_summary.gz                                                                                                                                                                                    100%  509KB 508.6KB/s 508.6KB/s   00:01    
     processing remote summary (http://pkgsrc.joyent.com/sdc6/2012Q2/i386/All)...
     updating database: 100%
     [admin@8d787a60-95a3-4651-95df-52ec313a09a0 ~]$ pkgin search nodejs
     nodejs-0.8.9 >       V8 JavaScript for clients and servers
     nodejs-0.8.6 >       V8 JavaScript for clients and servers
     nodejs-0.8.18 <      V8 JavaScript for clients and servers
     nodejs-0.8.16 <      V8 JavaScript for clients and servers
     nodejs-0.8.14 <      V8 JavaScript for clients and servers
     nodejs-0.8.11 =      V8 JavaScript for clients and servers
     nodejs-0.6.21 >      Evented I/O for V8 javascript
    
     =: package is installed and up-to-date
     <: package is installed but newer version is available
     >: installed package has a greater version than available package

As you can see 0.8.11 is currently installed on the system. If we need
a different version:

	sudo pkgin install nodejs-0.8.14
	
And this will upgrade the package.

** N.B. ** What we need to do is look at our package.json and make
sure that the nodejs version matches.  Looking at the releases listed
it means we have to check what is available before changing the
package.json version.

## What's different

Just a couple of things that I find I use all the time on linux boxes
and what the equivalent commands are on smartos.  The full document on
this is here :
http://wiki.joyent.com/wiki/display/jpc2/The+Joyent+Linux-to-SmartOS+Cheat+Sheet

 - starting and stopping services, this is handled by the svcs and svcadm commands
 - taskset => pbind (bind a process to a cpu)
 - /etc/fstab => /etc/vfstab
 - show network interface info ifconfig => ifconfig -a (the -a is important)
 - firewall config /etc/ipf.conf
 - package management
   - pkgin list (ls)
   - pkgin available (av)
   - pkgin install 
   - pkgin (returns a list of commands)
 - lsof => fuser, pfiles
 - vmstat, top => prstat (-Z shows zone information)

There are lots more, but that is a quick and dirty start, check out the cheatsheet.




	
