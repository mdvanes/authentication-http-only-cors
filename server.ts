import express, { CookieOptions, Response as ExpressResponse } from "express";
import https from "https";
import fs from "fs";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

const port = 3023;
const SUPER_SECRET_TOKEN = `SO_SECRET_${Date.now()}`;

app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static("public"));

// Allow CORS
// This simple version is only allowed when no `credentials` option of `fetch` is not set or is set to `none`. Otherwise, Access-Control-Allow-Origin may not be be `*`.
// app.use(cors());
const corsOptionsDelegate = (req, callback) => {
  if (req.header("Origin") === "https://localhost:3024") {
    // origin: true sets Access-Control-Allow-Origin to req.header("Origin")
    // credentials: true sets Access-Control-Allow-Credentials to true, which makes it allowed to send credentials cross origin
    callback(null, { origin: true, credentials: true });
  } else {
    callback(null, { origin: false });
  }
};
app.use(cors(corsOptionsDelegate));

const createAuthCookie = (
  token: string
): [name: string, value: string, options: CookieOptions] => [
  "Authentication",
  token,
  // TODO if secure: true, the cookie only works over HTTPS. It is send in the response, but is blocked by the browser from being added to the active cookies
  // In this state: it is possible to create the http-only cookie over cors, but it is not send with each fetch request, even if { credentials: true }
  // { httpOnly: true, maxAge: 250000, secure: false },
  // In this state: SameSite None only works when Secure true!
  { httpOnly: true, maxAge: 250000, secure: true, sameSite: "none" },
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

app.get("/api/nickname", (req, res) => {
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

/*
app.listen(port, () => {
  console.log("running on port 3023");
});

// For testing CORS, start another server
const otherDomainApp = express();
otherDomainApp.use(express.static("public"));
otherDomainApp.listen(3024, () => {
  console.log("running on port 3024");
});
*/
const server = https.createServer(
  {
    key: fs.readFileSync("localhost-privkey.pem"),
    cert: fs.readFileSync("localhost-cert.pem"),
  },
  app
);
server.listen(port, () => {
  console.log("running on port 3023");
});

// For testing CORS, start another server
const otherDomainApp = express();
otherDomainApp.use(express.static("public"));
const otherDomainServer = https.createServer(
  {
    key: fs.readFileSync("localhost-privkey.pem"),
    cert: fs.readFileSync("localhost-cert.pem"),
  },
  app
);
otherDomainServer.listen(3024, () => {
  console.log("running on port 3024");
});
