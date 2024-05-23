const express = require('express');
const router = express.Router();
const transporter = require('../config/mailer');
const path = require('path');

router.use(express.json());

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../assets/views/form.html'));
});

router.get('/confirm', async (req, res) => {
    const { id, fullName, email, role, area, reason, birthdate } = req.query;

    try {
        const response = await import('node-fetch');
        const fetch = response.default;
        const discordResponse = await fetch(`https://apiattt.discloud.app/user/${id}`);
        const data = await discordResponse.json();

        if (data.user) {
            const userInfo = data.user;
            res.render('confirm', {
                userInfo,
                id,
                fullName,
                email,
                role,
                area,
                reason,
                birthdate
            });
        } else {
            res.send(`
                <p>Usuário não encontrado. <a href="/">Tente novamente.</a></p>
            `);
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Erro ao verificar o usuário.');
    }
});

router.post('/submit', async (req, res) => {
    const { fullName, email, discordId, role, area, reason, birthdate } = req.body;

    // Verificar idade
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    if (age < 15) {
        return res.status(400).json({ message: 'Você deve ter pelo menos 15 anos para enviar este formulário.' });
    }

    const response = await import('node-fetch');
    const fetch = response.default;
    const discordResponse = await fetch(`https://apiattt.discloud.app/user/${discordId}`);
    const data = await discordResponse.json();
    const user = data.user;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: 'Nova Submissão de Formulário',
        html: `
        <div align="center">
            <img src="${user.avatarUrl}" alt="Foto de Perfil" style="border-radius: 50%; width: 100px;">
        </div>
        
        <div style="text-align: center;">
            <h1>${user.global_name}</h1>
            <p><strong>Nome:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Discord ID:</strong> ${user.username} (${discordId})</p>
            <p><strong>Papel:</strong> ${role}</p>
            <p><strong>Área:</strong> ${area}</p>
            <p><strong>Motivo:</strong> ${reason}</p>
            <p><strong>Data de Nascimento:</strong> ${birthdate}</p>
        </div>
        
        <div style="text-align: center;">
            <h1>Ações</h1>
            <a href="http://localhost:3000/respond?response=accept&email=${email}" style="display: inline-block; padding: 10px 20px; margin: 10px; background-color: #5865F2; color: #FFFFFF; text-decoration: none; border-radius: 5px;">Aceitar</a>
            <a href="http://localhost:3000/respond?response=reject&email=${email}" style="display: inline-block; padding: 10px 20px; margin: 10px; background-color: #ED4245; color: #FFFFFF; text-decoration: none; border-radius: 5px;">Recusar</a>
        </div>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Erro ao enviar email:', error);
            return res.status(500).send('Erro ao enviar o formulário.');
        }
        const uri = user.avatarUrl;
        res.render('submit', { email, uri }); // Renderiza a página de confirmação
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
