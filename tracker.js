require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const fs = require('fs');

const URL = 'https://infovisa.ibz.be/ResultFr.aspx?place=DEL&refnum=VFSDEL5506805';
const EMAIL_TO = 'nishantrajpoot101@hotmail.com';
const EMAIL_FROM = 'nishantrajpoot101@gmail.com'; // Note: correct format
const CHECK_INTERVAL = 10 * 60 * 1000; // 10 minutes

const PREV_FILE = './prev_decision.txt';

// Configure NodeMailer for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_FROM,
    pass: process.env.GMAIL_APP_PASSWORD, // From .env file
  },
});

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

function getPrevDecision() {
  if (fs.existsSync(PREV_FILE)) {
    return fs.readFileSync(PREV_FILE, 'utf8');
  }
  return null;
}

function setPrevDecision(decision) {
  fs.writeFileSync(PREV_FILE, decision, 'utf8');
}

async function sendEmail(newDecision) {
  const mailOptions = {
    from: EMAIL_FROM,
    to: EMAIL_TO,
    subject: 'Visa Decision Status Updated!',
    text: `The "Décision:" field has changed. New value: ${newDecision}`,
  };
  await transporter.sendMail(mailOptions);
  console.log('Email sent!');
}

async function checkDecision() {
  try {
    const currentDecision = await fetchDecision();
    console.log('Current Decision:', currentDecision);

    if (!currentDecision) {
      console.log('Could not find decision field!');
      return;
    }

    const prevDecision = getPrevDecision();

    if (currentDecision === 'En traitement') {
      setPrevDecision(currentDecision); // Always update (covers possible reset)
      console.log('Still in treatment. No action.');
      return;
    }

    if (currentDecision !== prevDecision) {
      await sendEmail(currentDecision);
      setPrevDecision(currentDecision);
    } else {
      console.log('Value unchanged, no email sent.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Run immediately and then every interval
checkDecision();
setInterval(checkDecision, CHECK_INTERVAL);
