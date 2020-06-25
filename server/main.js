require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const errorhandler = require("errorhandler");
const cors = require("cors");
const randomString = require("randomstring");
const qs = require("querystring");
const axios = require("axios");
const session = require("express-session");

/**
 * Create Express Server
 */
const app = express();
app.use(cors());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: randomString.generate(),
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
  })
);

const port = normalizePort(process.env.PORT || "3000");

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    //named pipe
    return val;
  }

  if (port >= 0) {
    //port number
    return port;
  }

  return false;
}

/**
 * Api
 */
app.get("/", (req, res) => {
  res.send("Invalid Endpoint");
});

app.get("/linkedin", async (req, res) => {
  req.session.csrf_string = randomString.generate();
  const linkedinAuthUrl =
    "https://www.linkedin.com/oauth/v2/authorization?" +
    qs.stringify({
      response_type: "code",
      client_id: process.env.Linkedin_Client_Id,
      redirect_uri: process.env.Linkedin_Redirect_Uri,
      state: req.session.csrf_string,
      scope: "r_liteprofile r_emailaddress",
    });
  // redirect user with express
  res.redirect(linkedinAuthUrl);
});

app.get("/bitly", (req, res) => {
  req.session.csrf_string = randomString.generate();
  const bitlyAuthorizeURL =
    "https://bitly.com/oauth/authorize?" +
    qs.stringify({
      client_id: process.env.Bitly_Client_Id,
      // client_secret: process.env.Bilty_Client_secret,
      state: req.session.csrf_string,
      redirect_uri: process.env.Bitly_Redirect_Uri,
    });
  res.redirect(bitlyAuthorizeURL);
});
app.get("/twitter", async (req, res) => {
  await axios
    .post("https://api.twitter.com/oauth/request_token", null, {
      headers: {
        authorization:
          'OAuth oauth_callback="https%3A%2F%2F7699e7a4da58.ngrok.io%2FtwitterRedirect", oauth_consumer_key="2906JsMoayqgSed47Yra3SuDG", oauth_nonce="i1PZ8sXzx6OMfFZcgPEHFgtfIJOXRrti", oauth_signature="6dooBJIRYzt%2Bb8XYtHoECthg3gQ%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1593087479", oauth_token="2784067891-y2C8u1Z8D5hknyreZzHfKhot0wyw5pNKdcZmrfC", oauth_version="1.0"',
      },
    })
    .then((result) => {
      console.log(result.data);
      const twitterAuthorizeUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${
        result.data.split("&")[0].split("=")[1]
      }`;
      res.redirect(twitterAuthorizeUrl);
    })
    .catch((error) => console.log(error));
});

app.get("/twitterRedirect", async (req, res) => {
  console.log(req.query);
  await axios
    .post("https://api.twitter.com/oauth/access_token", null, {
      headers: {
        authorization: `OAuth oauth_callback=${process.env.Twitter_Redirect_Uri}, oauth_consumer_key=${process.env.Twitter_Customer_API_Key}, oauth_nonce="i1PZ8sXzx6OMfFZcgPEHFgtfIJOXRrti", oauth_signature="6dooBJIRYzt%2Bb8XYtHoECthg3gQ%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1593087479", oauth_token=${req.query.oauth_token}, oauth_version="1.0"`,
      },
      params: {
        oauth_verifier: req.query.oauth_verifier,
      },
    })
    .then((response) => {
      console.log(response.data);
      console.log("Your Access Token: " + response.data);
      req.session.access_token = response.data.access_token;
    })
    .catch((error) => {
      console.log(error);
    });
});

app.get("/linkedinRedirect", async (req, res) => {
  console.log(req);
  const code = req.query.code;
  const returnedState = req.query.state;

  if (req.session.csrf_string === returnedState) {
    await axios
      .post("https://www.linkedin.com/oauth/v2/accessToken", null, {
        params: {
          grant_type: "authorization_code",
          code: code,
          redirect_uri: process.env.Linkedin_Redirect_Uri,
          client_id: process.env.Linkedin_Client_Id,
          client_secret: process.env.Linkedin_Client_Secret,
        },
      })
      .then((response) => {
        console.log(response.data);
        console.log("Your Access Token: " + response.data);
        req.session.access_token = response.data.access_token;
        res.redirect("/user");
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    // if state doesn't match up, something is wrong
    // just redirect to homepage
    res.redirect("/");
  }
});
app.get("/bitlyRedirect", async (req, res) => {
  console.log(req.query);
  const code = req.query.code;
  const returnedState = req.query.state;

  if (req.session.csrf_string === returnedState) {
    await axios
      .post("https://api-ssl.bitly.com/oauth/access_token", null, {
        params: {
          client_id: process.env.Bitly_Client_Id,
          // client_secret: process.env.Bitly_Client_Secret,
          code: code,
          redirect_uri: process.env.Bitly_Redirect_Uri,
          state: req.query.state,
          grant_type: "authorization_code",
        },
      })
      .then((response) => {
        console.log(response.data);
        console.log("Your Access Token: " + response.data);
        req.session.access_token = response.data.access_token;
        res.redirect("/user");
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    // if state doesn't match up, something is wrong
    // just redirect to homepage
    res.redirect("/");
  }
});

app.get("/user", (req, res) => {
  // GET request to get emails
  console.log(req.session.access_token);
  // this time the token is in header instead of a query string
  axios({
    url: "https://api.linkedin.com/v2/me",
    method: "get",
    headers: {
      Authorization: `Bearer ${req.session.access_token}`,
    },
  })
    .then((result) => {
      console.log(result.data);
      return result.data;
    })
    .catch((error) => {
      console.log(error);
    });
});

/**
 * Error Handler
 */
if (process.env.NODE_ENV === "development") {
  // only use in development
  app.use(errorhandler());
} else {
  app.use((err, res) => {
    res.status(500).send("Server Error");
  });
}
app.listen(port, () => {
  console.log(`Example app listening on ${port}!`);
  console.log("   Press CTRL-C to stop\n");
});

module.exports = app;
