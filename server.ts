const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

const port = 3023;
const SUPER_SECRET_TOKEN = `SO_SECRET_${Date.now()}`;

app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static("public"));

// Allow CORS
// This is only allowed when no `credentials` option of `fetch` is not set or is set to `none`. Otherwise, Access-Control-Allow-Origin may not be be `*`.
// app.use(cors());
const corsOptionsDelegate = (req, callback) => {
  if (req.header("Origin") === "http://localhost:3024") {
    // origin: true sets Access-Control-Allow-Origin to req.header("Origin")
    callback(null, { origin: true, credentials: true });
  } else {
    callback(null, { origin: false });
  }
};
app.use(cors(corsOptionsDelegate));

const createAuthCookie = (token: any) => [
  "Authentication",
  token,
  // TODO if secure: true, the cookie only works over HTTPS. It is send in the response, but is blocked by the browser from being added to the active cookies
  { httpOnly: true, maxAge: 250000, secure: false },
];

const logMe = (endpoint, msg = "", ...rest) => {
  const d = new Date();
  const hhmm = `${d
    .getHours()
    .toString()
    .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  console.log(`${hhmm} ${endpoint}`.padEnd(20), `| ${msg}`, ...rest);
};

app.post("/api/login", (req, res) => {
  logMe("/api/login", "body", req.body);
  if ((req.body.password = "test")) {
    res
      .cookie(...createAuthCookie(SUPER_SECRET_TOKEN))
      .send({ firstname: "eric" });
  } else {
    res
      .status(403)
      .cookie(...createAuthCookie(""))
      .send({});
  }
});

app.post("/api/nickname", (req, res) => {
  logMe("/api/nickname", "cookies=", req.cookies.Authentication);
  if (req.cookies.Authentication === SUPER_SECRET_TOKEN) {
    res.send({ nickname: "magneto" });
  } else {
    res.status(403).send({});
  }
});

app.post("/api/logout", (req, res) => {
  logMe("/api/logout");
  res.cookie(...createAuthCookie("")).send({ firstname: "" });
});

app.listen(port, () => {
  console.log("running on port 3023");
});

// For testing CORS, start another server
const otherDomainApp = express();
otherDomainApp.use(express.static("public"));
otherDomainApp.listen(3024, () => {
  console.log("running on port 3024");
});
