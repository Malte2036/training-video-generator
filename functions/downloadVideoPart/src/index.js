const sdk = require("node-appwrite");
const fs = require("fs");
const ytdl = require("ytdl-core");
const crypto = require("crypto");

module.exports = async function (req, res) {
  let logString = "";
  function log(param) {
    logString += param + " \n";
  }

  async function downloadVideo(youtubeVideoId, filename, start) {
    await new Promise((resolve, reject) => {
      const stream = ytdl(`https://www.youtube.com/watch?v=${youtubeVideoId}`, {
        // TODO: "begin" not working
        begin: `${start}s`,
        quality: "135",
      }).pipe(fs.createWriteStream(filename));

      stream.on("finish", () => {
        log("downloaded video");
        resolve();
      });
    });
  }

  const client = new sdk.Client();

  // You can remove services you don't use
  let database = new sdk.Database(client);
  let storage = new sdk.Storage(client);

  if (
    !req.env["APPWRITE_FUNCTION_ENDPOINT"] ||
    !req.env["APPWRITE_FUNCTION_API_KEY"]
  ) {
    throw new Error(
      "Environment variables are not set. Function cannot use Appwrite SDK."
    );
  }
  client
    .setEndpoint(req.env["APPWRITE_FUNCTION_ENDPOINT"])
    .setProject(req.env["APPWRITE_FUNCTION_PROJECT_ID"])
    .setKey(req.env["APPWRITE_FUNCTION_API_KEY"])
    .setSelfSigned(true);

  const data = JSON.parse(req.env["APPWRITE_FUNCTION_EVENT_DATA"]);
  const { youtubeVideoId, start, end } = data;

  const filename = crypto.randomUUID() + ".mp4";

  await downloadVideo(youtubeVideoId, filename, start);

  log(`${__dirname}/../ffmpeg -i ${filename} -vf trim=${start}:${end} cut.mp4`);

  await new Promise((resolve, reject) => {
    const { exec } = require("child_process");

    exec(
      `yes | ${__dirname}/../ffmpeg -i ${filename} -vf trim=${start}:${end} cut.mp4`,
      (error, stdout, stderr) => {
        //ffmpeg logs to stderr, but typically output is in stdout.
        log(error);
        log(stdout);
        log(stderr);
        resolve();
      }
    );
  });

  //await storage.createFile("video_parts", "unique()", "cut.mp4");

  log(`video ${filename} created`);

  res.json({
    log: logString,
    data,
  });
};
/*
const { exec } = require("child_process");

exec(
  `yes | ${__dirname}/../ffmpeg -i ../13245034-a16a-4061-8678-f409eb0f5009.mp4 -vf trim=48:61 cut.mp4`,
  (error, stdout, stderr) => {
    //ffmpeg logs to stderr, but typically output is in stdout.
    console.log(error);
    console.log(stdout);
    console.log(stderr);
    //resolve();
  }
);
*/