const nodemailer = require("nodemailer");
const User = require('./models/users');

const sendEmailsToUsers = async () => {
  try {
    // Fetch all users from the database
    const users = await User.findAll();
    if (users.length === 0) {
      console.log("Não foram encontrados usuários para enviar e-mails.");
      return;
    }

    // Configure Nodemailer with Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // Sender email address
        pass: process.env.GMAIL_PASS, // App password
      },
    });

    // Loop through each user and send an email
    for (const user of users) {
      const mailOptions = {
        from: `"Equipe Caboom 💣" <${process.env.GMAIL_USER}>`,
        to: user.email, // Receiver email address
        subject: "💣 [Importante] Vazamento de Dados - Equipe Caboom",
        text: `
💣 Olá, ${user.name}!

Estamos entrando em contato para informar sobre um incidente de segurança que pode ter afetado os seus dados pessoais.

💥 O que aconteceu?  
No dia de hoje, identificamos um acesso não autorizado aos nossos sistemas. Informações como [exemplo: nome, e-mail e telefone] podem ter sido acessadas.

💥 O que fizemos?  
- Reforçamos a segurança do sistema.  
- Estamos investigando o ocorrido com rigor.

💥 O que você deve fazer?  
Recomendamos:  
1️⃣ Fique atento a contatos suspeitos.  
2️⃣ Altere senhas usadas em nossa plataforma, se necessário.  
3️⃣ Entre em contato conosco para dúvidas.

🔥 Estamos disponíveis para ajudar!  
📧 suporte@caboom.com | 📞 (11) 9999-9999  

💣 Atenciosamente,  
Equipe Caboom 🚀
        `,
        html: `
<p>💣 <strong>Olá, ${user.name}!</strong></p>

<p>Estamos entrando em contato para informar sobre um incidente de segurança que pode ter afetado os seus dados pessoais.</p>

<h3>💥 O que aconteceu?</h3>
<p>No dia de hoje, identificamos um acesso não autorizado aos nossos sistemas. Informações como <em>[exemplo: nome, e-mail e telefone]</em> podem ter sido acessadas.</p>

<h3>💥 O que fizemos?</h3>
<ul>
  <li>🛡️ Reforçamos a segurança do sistema.</li>
  <li>🔍 Estamos investigando o ocorrido com rigor.</li>
</ul>

<h3>💥 O que você deve fazer?</h3>
<ol>
  <li>1️⃣ Fique atento a contatos suspeitos.</li>
  <li>2️⃣ Altere senhas usadas em nossa plataforma, se necessário.</li>
  <li>3️⃣ Entre em contato conosco para dúvidas.</li>
</ol>

<p>🔥 <strong>Estamos disponíveis para ajudar!</strong></p>
<p>📧 <a href="mailto:suporte@caboom.com">suporte@caboom.com</a> | 📞 (11) 9999-9999</p>

<p>💣 Atenciosamente,<br>Equipe Caboom 🚀</p>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`💣 Email enviado para ${user.email}`);
      } catch (error) {
        console.error(`💥 Erro ao enviar e-mail para ${user.email}:`, error);
      }
    }
  } catch (error) {
    console.error("💥 Erro ao enviar e-mails:", error);
  }
};

module.exports = sendEmailsToUsers;
