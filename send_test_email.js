require('dotenv').config();
const nodemailer = require('nodemailer');

const EMAIL_TO = 'nishantrajpoot101@hotmail.com';
const EMAIL_FROM = 'nishantrajpoot101@gmail.com';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_FROM,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});


const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://infovisa.ibz.be/ResultFr.aspx?place=DEL&refnum=VFSDEL5506805';

async function fetchDecision() {
  const response = await axios.get(URL);
  const $ = cheerio.load(response.data);

  let decisionVal = null;

  // Find the value next to "Décision:"
  $('td').each((i, elem) => {
    if ($(elem).text().trim() === 'Décision:') {
      decisionVal = $(elem).next('td').text().trim();
    }
  });

  return decisionVal;
}

async function sendTestEmailWithDecision() {
  try {
    const currentDecision = await fetchDecision();
    const mailOptions = {
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: 'Test Email from Visa Tracker (Current Decision)',
      text: `Current value of Décision: ${currentDecision}`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully with current Decision value!');
  } catch (err) {
    console.error('Failed to send test email:', err.message);
  }
}

sendTestEmailWithDecision();
