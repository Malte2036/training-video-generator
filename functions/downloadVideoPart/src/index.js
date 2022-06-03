const sdk = require("node-appwrite");
const fs = require("fs");
const ytdl = require("ytdl-core");
const crypto = require("crypto");

module.exports = async function (req, res) {
  let logString = "";
  function log(param) {
    logString += param + " \n";
  }

  async function downloadVideo(youtubeVideoId, filename) {
    await new Promise((resolve, reject) => {
      const stream = ytdl(`https://www.youtube.com/watch?v=${youtubeVideoId}`).pipe(
        fs.createWriteStream(filename)
      );

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

  const filename = crypto.randomUUID();

  await downloadVideo(youtubeVideoId, filename);

  await storage.createFile("video_parts", "unique()", filename);

  log(`video ${filename} created`);

  res.json({
    log: logString,
    data,
  });
};
