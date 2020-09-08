const pug = require("pug");
const juice = require("juice");
const htmlToText = require("html-to-text");
const postmark = require("postmark");

var client = new postmark.ServerClient(process.env.POSTMARK_PASS);

const generateHTML = (filename, options = {}) => {
  // not needed outsise mail.js so just a function (no exports)
  const html = pug.renderFile(
    `${__dirname}/../views/email/${filename}.pug`,
    options
  );
  const inlined = juice(html);
  return inlined; // styles inlined for emails
};

exports.send = async (options) => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.fromString(html);
  return client.sendEmail({
    From: `Loomernescent <talk@tbullock.net>`,
    To: options.user.email,
    Subject: options.subject,
    HtmlBody: html,
    TextBody: text,
    MessageStream: "outbound",
  });
};
