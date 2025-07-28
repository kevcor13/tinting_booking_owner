## Booking Website for scheduling appointments 

This is a simple project, allowing users to schedule appoointments and owners to set up their own appointment times. 
this is built using React as frontend and Google Sheets as a "serverless" database, managed by google scripts. 

It features an Owner_Interface for managing available time slots and generates a link to a seperate Client_ineterface, where 
customers can book appointments. 

## Features
- Owner dashboard
- Add & Deleting slots
- Real-Time Backend
- API via Google scripts
- Sharable client link

## Tech Stack 
- **Frontend**: React, React Router DOM, Node.js
- **Styling**: CSS
- **Backend**: Google Apps Scripts Web API
- **Deployment**: Vercel

## 🧪 How It Works

1. The admin logs into the interface and adds available dates and times.
2. The app makes a `POST` request to a [Google Apps Script Web App](https://script.google.com/).
3. The Google Script updates the connected Google Sheet.
4. The client page auto-updates via real-time syncing.


<img width="811" height="871" alt="image" src="https://github.com/user-attachments/assets/88a8fdff-e3e5-42b1-a06d-1bff98c79c35" />

