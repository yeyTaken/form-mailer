const express = require('express');
const router = express.Router();
const transporter = require('../config/mailer');
const path = require('path');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../assets/views/form.html'));
});

router.post('/submit', (req, res) => {
    const { name, email } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: 'New Form Submission',
        html: `
            <p>Name: ${name}</p>
            <p>Email: ${email}</p>
            <p><a href="http://localhost:3000/respond?response=accept&email=${email}">Aceitar</a></p>
            <p><a href="http://localhost:3000/respond?response=reject&email=${email}">Recusar</a></p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send('Error sending email');
        }
        res.send('Form submitted successfully');
    });
});

router.get('/respond', (req, res) => {
    const { response, email } = req.query;
    const responseText = response === 'accept' ? 'accepted' : 'rejected';

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Form Submission ${responseText}`,
        text: `Your form submission was ${responseText}.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send('Error sending email');
        }
        res.send(`Response sent successfully: ${responseText}`);
    });
});

module.exports = router;
