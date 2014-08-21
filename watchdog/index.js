var https = require('https');

var transports = {
//	mail: require('./transports/mail.js'),
	irc: require('./transports/irc.js')
};
var debug = true;

//var servers = ['release.informaat.net', 'release.test.informaat.net', 'foundation.informaat.net'];
var servers = ['sb_server_refactor.test.informaat.net'];

// Poll the URLs
function pollUrls(urls) {
	urls.forEach(function (url) {
		debug && console.log(new Date().toISOString() + ' Polling', url);

		https.get({
			hostname: url,
			rejectUnauthorized: false
		},function (res) {
			if (res.statusCode != 200) notOK(url, res);
		}).on('error', function (err) {
				console.error(url, err.message, err);
			});

	});
}

function exportSilos(urls) {
	urls.forEach(function (url) {
		var options = {
			hostname: url,
			path: '/api/exports',
			rejectUnauthorized: false,
			method: 'POST',
			headers: {
				// cookie for Aiko @ sb_server_refactor.test.informaat.net
				'Cookie': '__DialogicaAuth="BjKjGjzcPU4fC2pJJoDcNcqTbailfGF8AG+xtICiKbP4WCMys+N8zg=="'
			}
		};
		debug && console.log(new Date().toISOString() + ' Exporting', url+options.path);

		var req = https.request(options, function (res) {
			res.on('data', function(d) {
				debug && console.log(d.toString && d.toString());
			});
			if (res.statusCode != 200) notOK(url+options.path, res);
		});
		req.end();
		req.on('error', function (err) {
			console.error(url, err.message, err);
		});

	});
}

function alert(message) {
	// Use the `transports` to send out an alert
	for (var i in transports) {
		transports[i](message);
	}
}

// Handle not OK
function notOK(url, res) {
	console.error(url, res.statusCode);
	alert(url);
}

// Set an interval of 5 minutes
var interval = 5 * 1000 * 60;

setInterval(function () {
	pollUrls(servers);
}, interval);

console.log('Polling servers every %d ms', interval);

// Set an interval of 15 minutes
interval = 15 * 1000 * 60;

setInterval(function () {
	exportSilos(servers);
}, interval);
// exportSilos(servers);

console.log('Exporting servers every %d ms', interval);
