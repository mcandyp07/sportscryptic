const express = require('express');
const simpleOauthModule = require('simple-oauth2');
const randomstring = require('randomstring');
const port = process.env.PORT || 3000;

const app = express();

const oauth2 = simpleOauthModule.create({
  client: {
    id: process.env.OAUTH_CLIENT_ID,
    secret: process.env.OAUTH_CLIENT_SECRET,
  },
  auth: {
    tokenHost: 'https://github.com',
    tokenPath: '/login/oauth/access_token',
    authorizePath: '/login/oauth/authorize',
  },
});

app.get('/auth', (req, res) => {
  const authorizationUri = oauth2.authorizationCode.authorizeURL({
    redirect_uri: process.env.REDIRECT_URL,
    scope: 'repo,user',
    state: randomstring.generate(32),
  });

  res.redirect(authorizationUri);
});

app.get('/callback', (req, res) => {
  const options = {
    code: req.query.code,
  };

  oauth2.authorizationCode.getToken(options).then((result) => {
    console.log('The resulting token: ', result);
    const token = oauth2.accessToken.create(result);

    return res.status(200).json(token);
  }).catch((error) => {
    console.error('Access Token Error', error.message);
    return res.status(500).json('Authentication failed');
  });
});

app.get('/success', (req, res) => {
  res.send('');
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
