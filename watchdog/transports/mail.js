// # Email alert transport

// https://github.com/andris9/Nodemailer
var mail = require('nodemailer');

var smtp = mail.createTransport("SMTP", {
	service: "Gmail",
	auth: {
		user: 'informaatipeops@gmail.com',
		pass: 'superhappyspacemonkey'
	}
});

function send(server) {
	smtp.sendMail({
		from: 'OPS <ipedevs@informaat.nl>',
		to: 'IPE Developers <ipedevs@informaat.nl>',
		subject: 'Server down: ' + server,
		text: server + ' appears to be down.'
	}, function (error, res) {
		if (error) {
			console.error(error);
		} else {
			console.log('Message sent: ' + res.message);
		}
	});
}

module.exports = send;