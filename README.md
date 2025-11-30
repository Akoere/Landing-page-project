🔐 Google Sheets Authentication System

A serverless authentication system (Sign Up & Login) that uses Google Sheets as a database and Google Apps Script as the backend API.

✨ Features

User Registration: Saves Name, Email, and Hashed Password to Google Sheets.

Secure Login: Authenticates users against the sheet data.

Security: Passwords are hashed (SHA-256) before sending to the server.

Dashboard: Protected home page that only appears after login.

Session Persistence: Keeps users logged in using Local Storage.

Dark Mode: Built-in theme toggle.

🛠️ Tech Stack

Frontend: HTML5, CSS3, Vanilla JavaScript

Backend: Google Apps Script

Database: Google Sheets

🚀 How to Set Up (Backend)

Prepare the Google Sheet
Create a new Google Sheet.

Rename the bottom tab from "Sheet1" to "Users" (Case sensitive).

In the first row, add the headers for Date, Name, Email, and PasswordHash in columns A, B, C, and D respectively.

Deploy the Script
In your Google Sheet, navigate to Extensions > Apps Script.

Delete any existing code and paste the backend script provided in your project files.

Click the Deploy button and select New deployment.

IMPORTANT SETTINGS:

Select type: Web app

Execute as: Me

Who has access: Anyone (This is crucial for the app to function).

Click Deploy and copy the Web app URL generated (it will end in "/exec").

💻 How to Run (Frontend)

Open the index.html file in your code editor.

Locate the configuration section near the bottom of the script tag.

Paste the Web App URL you copied in the previous step into the configuration variable.

Save the file.

Open index.html in any web browser to run the application.
