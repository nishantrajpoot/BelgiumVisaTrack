const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

// For parsing POST JSON if needed
app.use(express.json());

// Nodemailer/Gmail config
const EMAIL_TO = process.env.EMAIL_TO;
const EMAIL_FROM = process.env.EMAIL_FROM;
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_FROM,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const URL = 'https://infovisa.ibz.be/ResultFr.aspx?place=DEL&refnum=VFSDEL5506805';

// Scrape the Decision value from webpage
async function fetchDecision() {
  const response = await axios.get(URL);
  const $ = cheerio.load(response.data);
  let decisionVal = null;
  $('td').each((i, elem) => {
    if ($(elem).text().trim() === 'Décision:') {
      decisionVal = $(elem).next('td').text().trim();
    }
  });
  return decisionVal;
}

// Serve basic UI
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="font-family: sans-serif; max-width: 400px; margin: 2em auto;">
        <h1>Visa Tracker Dev UI</h1>
        <div>
          <strong>Current Decision:</strong>
          <span id="decision-value">Loading...</span>
        </div>
        <button onclick="sendTestEmail()" style="margin-top: 2em;">Send Test Email</button>
        <div id="mail-result" style="margin-top: 1em;"></div>
        <script>
          function refreshDecision() {
            fetch('/current-decision')
              .then(r => r.json())
              .then(d => {
                document.getElementById('decision-value').innerText = d.decision || 'N/A';
              });
          }
          refreshDecision();
          setInterval(refreshDecision, 15000); // Refresh every 15s

          function sendTestEmail() {
            fetch('/send-test-email', { method: 'POST' })
              .then(r => r.json())
              .then(d => {
                document.getElementById('mail-result').innerText = d.message;
              });
          }
        </script>
      </body>
    </html>
  `);
});

// API endpoint: Fetch current decision
app.get('/current-decision', async (req, res) => {
  try {
    const decision = await fetchDecision();
    res.json({decision});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// API endpoint: Send test email with current decision
app.post('/send-test-email', async (req, res) => {
  try {
    const decision = await fetchDecision();
    const mailOptions = {
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: 'Test Email from Visa Tracker Dev Server',
      text: `Current value of Décision: ${decision}`,
    };
    await transporter.sendMail(mailOptions);
    res.json({message: 'Test email sent with current Decision value!'});
  } catch (err) {
    res.status(500).json({message: 'Failed to send test email: ' + err.message});
  }
});

app.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
});
