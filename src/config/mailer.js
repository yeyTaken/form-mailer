const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Error with the email transporter configuration:', error);
    } else {
        console.log('Email transporter is ready to send messages');
    }
});

module.exports = transporter;
