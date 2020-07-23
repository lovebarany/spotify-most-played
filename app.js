var express = require('express');
var cors = require('cors');
var queryString = require('querystring');
var cookieParser = require('cookie-parser');
var axios = require('axios');

var clientId = 'YOURCLIENTID';
var clientSecret = 'YOURCLIENTSECRET';
var redirectUri = 'http://localhost:8888/callback';
var port = 8888;

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// used for cookies
var stateKey = 'spotify_auth_state';

var app = express();

// make all assets in /public available
app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

// initial login
app.get('/login', function (_req, res) {
    var responseType = 'code';
    var state = generateRandomString(16);
    // we need this permission to read top songs and artists for a user
    var scope = 'user-top-read';

    // use state to make sure everything is right
    res.cookie(stateKey, state);

    res.redirect('https://accounts.spotify.com/authorize?' + queryString.stringify({
        client_id: clientId,
        response_type: responseType,
        redirect_uri: redirectUri,
        state: state,
        scope: scope
    }));
});

// we get here after getting a code from Spotify after the user has logged in
app.get('/callback', function (req, res) {
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies[stateKey];  

    // something is wrong
    if (state === null || state !== storedState) {
        res.redirect('/#' + queryString.stringify({
            error: "state_mismatch"
        }));
    } else {
        // could also put base64(client_id:client_secret) as a header
        var url = "https://accounts.spotify.com/api/token?"
            + queryString.stringify({
                grant_type: "authorization_code",
                code: code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret
        });
        axios.post(url)
            .then(function (response) {
                var accessToken = response.data.access_token;
                console.log('Getting most played song...');
                var config = {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                };
                res.redirect('/#' + queryString.stringify({
                    access_token: accessToken
                }));
                axios.get('https://api.spotify.com/v1/me/top/tracks', config)
                    .then(function(response) {
                        console.log(response.data);
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
            })
            .catch(function (error) {
                res.redirect('/#' + queryString.stringify({
                    error: 'invalid_token'
                }));
                console.log(error);
            });
    }
});

console.log(`Listening on port ${port}`);
app.listen(port);
