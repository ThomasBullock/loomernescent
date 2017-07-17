const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: process.env.MAIL_PORT,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASS
	}
});

// transport.sendMail({
// 	from: 'Owenny Paul <80hurtz@gmail.com>',
// 	to: 'randy@spears.com',
// 	subject: 'Just trying things out!',
// 	html: 'Hey I <strong>Love</strong> you',
// 	text: 'Hey I **love you**'
// });

const generateHTML = (filename, options = {}) => { // not needed outsise mail.js so just a function (no exports)
	const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
	const inlined = juice(html);
	return inlined; // styles inlined for emails
}

exports.send = async (options) => {
	const html = generateHTML(options.filename, options );
	const text = htmlToText.fromString(html);
	const mailOptions = {
		from: `Loomernescent <noreply@loomernescent.com>`,
		to: options.user.email,
		subject: options.subject,
		html: html,
		text: text		
	};

	const sendMail = promisify(transport.sendMail, transport);
	return sendMail(mailOptions);
}