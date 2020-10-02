const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');
const { process } = require('autoprefixer');
const dotenv = require('dotenv');
const result = dotenv.config({path: `${__dirname}/../variables.env`});

const transport = nodemailer.createTransport({
    host: result.parsed.MAIL_HOST, //process.env.MAILHOST,
    port: result.parsed.MAIL_PORT, //process.env.MAILPORT,
    auth: {
        user: result.parsed.MAIL_USER, //process.env.MAILUSER,
        pass: result.parsed.MAIL_PASS //process.env.MAILPASS
    }
});

const generateHTML = (filename, options = {}) => {
    const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
    const inlined = juice(html);
    return inlined;
}

exports.send = async (options) => {
    const html = generateHTML(options.filename, options);
    const text = htmlToText.fromString(html);
    const mailOptions = {
        from: 'Wes Bos <wes@bos.com>',
        to: options.user.email,
        subject: options.subject,
        html: html,
        text: text
    }
    const sendMail = promisify(transport.sendMail, transport);
    return sendMail(mailOptions);
}