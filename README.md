<h1 align="center">:muscle: Training Video Generator</h1>
<p align="center">Fullstack application to automatically generate random strength training videos, based on Youtube video datasets.</p>

## :zap: Pages

:dart: **VideosPage** (View and generate Videos)

:dart: **VideoPartsPage** (View and create Youtube Video Datasets)

## 💡 The idea
Strength training videos on Youtube get boring for a long time, because they always contain the same exercises in the same order. To solve this problem, I thought of programming a "Training Video Generator", which randomly generates new videos based on different pre-selected Youtube video datasets.

The generated videos have the advantage that they are randomly generated and therefore offer a very high variety. Through this variety, the strength training can be much more varied than if you always have the same exercises in the same order.

## 🎯 Implementation
### Frontend
We have a web frontend where we can create Youtube video datasets (called 'VideoParts'). To create a dataset you have to specify the following parameters:

* `youtubeVideoId`: found in the youtube video url.
* `start`: at which second the first exercise starts
* `length`: how long an exercise goes in the youtube video
* ` repeat`: how many different exercises there are in the video

Now when you have created datasets, you can go to the 'VideosPage' and start generating a video at the bottom of the page.
In the form for creating videos you have to specify how many exercises should be in the generated video and which datasets should be included.
When you click the 'GENERATE' button, all selected datasets will be shuffled, then randomly drawn the number of exercises and stored in a database.

### Backend
Whenever a new video is 'generated' in the frontend, a process starts immediately in the backend, which first downloads the original videos from Youtube and then, in the previously randomly generated order, cuts them together. When the new video has been completely edited from the original video snippets, the .mp4 is uploaded to a Firebase storage. And the generated video can be viewed in the frontend.

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



## :technologist: Technologies used

* [Next.js](https://nextjs.org/)
* [Firebase](https://console.firebase.google.com/)
* [Material UI](https://mui.com/)
