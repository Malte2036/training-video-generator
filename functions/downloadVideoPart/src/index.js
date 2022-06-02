const sdk = require("node-appwrite");

module.exports = async function (req, res) {
  let logString = "";
  function log(param) {
    logString += param + " \n";
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
  const { youtubeId, start, end } = data;

  log("success");

  res.json({
    log: logString,
    data
  });
};
