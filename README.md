<h1 align="center">:muscle: Training Video Generator</h1>
<p align="center">Fullstack application to automatically generate random strength training videos, based on Youtube video datasets.</p>

## :zap: Pages

:dart: **VideosPage** (View and generate Videos)

:dart: **VideoPartsPage** (View and create Youtube Video Datasets)

## 🔧 Setup

You can deploy the frontend and the backend on a server of your choice, for example on [Linode](https://www.linode.com/).
The real data itself is stored in a Firestore of [Google Firebase](https://console.firebase.google.com/).

### Firebase:

1. Create a new [Firebase Project](https://console.firebase.google.com/).
2. Create a Firestore Database.
3. Create a web app in Firebase and save the specified Firebase configuration. Which should look like this: 
```
const firebaseConfig = {
  apiKey: "yourGeneratedApiKey",
  authDomain: "projectName-id.firebaseapp.com",
  projectId: "projectName-id",
  storageBucket: "projectName-id.appspot.com",
  messagingSenderId: "yourMessageSenderId",
  appId: "yourAppId"
};
``` 

### Backend

In your Firebase project goto 'Settings' > 'Project Settings' > 'Service accounts' and generate a 'new private key'.
Copy the `serviceAccountKey.json` file into the `backend/` folder.

Start the backend with:

```bash
$ cd backend
$ npm install
$ npm start
```
and ensure that you have [ffmpeg](https://ffmpeg.org/) installed on your server.

### Frontend

```bash
$ cd frontend
```

Rename the `.env.example` file to `.env`. Fill in all the fields in the `.env` file using your `firebaseConfig` generated above.

Build and run the Frontend Project.

```bash
$ npm install

# development
$ npm run dev

# production
$ npm run build
$ npm run start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🚀 How To Use



## :technologist: Technologies used

* [Next.js](https://nextjs.org/)
* [Firebase](https://console.firebase.google.com/)
* [Material UI](https://mui.com/)
