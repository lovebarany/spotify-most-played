# spotify-api-test-app
Simple app to get your most played songs on Spotify.

# Usage
Register an app on your spotify developer dashboard, and plug in: the client id, the client secret at the top of app.js.
In the dashboard for your app, you need to set `http://localhost:8888/callback` as a Redirect URI, otherwise Spotify will complain that the redirect URI is invalid!!
Then run `node app.js` and go to `localhost:8888`
