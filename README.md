# Visa Tracker

This Node.js project tracks the decision status of a visa application on a public website and notifies you by email when it changes. It also includes a simple dev server for manual checks and test emails.

---

## Features
- Periodic scraping of a visa application status webpage
- Sends an email when the decision status changes
- Simple dev server (`npm run dev`) with a UI to check the status and send a test email

---

## Usage

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Create a `.env` file in your project root with:
```
GMAIL_APP_PASSWORD=your_gmail_app_password_here
```
- Uses Gmail for sending notification/test emails.
- Make sure app password is enabled for your Gmail account if 2FA is on.

### 3. Run the auto-tracker
This will scrape and check for updates every 10 minutes;
```bash
node tracker.js
```
- To run it in the background: `nohup node tracker.js &`
- To run always on login, see platform-specific instructions below.

### 4. Run the development server
This will start a local web UI at [http://localhost:3000](http://localhost:3000):
```bash
npm run dev
```

---

## Dev Server
- [http://localhost:3000](http://localhost:3000)
- Shows the current visa "Decision" value
- Lets you send a test email with the current decision
- Decision status auto-refreshes every 15 seconds

---

## Deploy/Host
See the notes in this README or ask for a detailed deployment guide for Render, Railway, or a VPS.

---

## Security
- **.env is in .gitignore:** Safe for Git/GitHub use! Never commit real secrets.

---

## License
MIT (or specify here)
