var irc = require('irc');

// https://node-irc.readthedocs.org/en/latest/API.html#irc.Client
var options = {
	userName: 'IPE_Watchdog',
	realName: 'IPE Watchdog',
	autoRejoin: true,
	autoConnect: false,
	channels: ['#IPE'],
	floodProtection: true,
	floodProtectionDelay: 1000
};
var nick = options.userName;

var client = new irc.Client('irc.freenode.net', nick, options);

client.on('error', function (err) {
	console.log(err);
});

client.on('registered', function (msg) {
	// console.log('registered', msg);
});

var connected = false;
client.connect(function () {
	// console.dir(arguments);

	// Claim nick
	client.say("nickserv", "identify " + nick + " blotekont");

	// Join #IPE
	client.join('#IPE blotekont');
	connected = true;
});

function say(message) {
	if (connected) {
		client.say('#IPE', 'Server down: ' + message);
	}
	else {
		console.error('not Connected to IRC, BTW: Server down:', message);
	}
}

module.exports = say;