const express = require("express")
const SpotifyWebApi = require("spotify-web-api-node")
const bodyParser = require("body-parser")
const path = require("path")
require('dotenv').config();

var credentials = {
  clientId: process.env.CLIENTID,
  clientSecret: process.env.CLIENTSECRET,
  redirectUri: process.env.REDIRECTURI
};

const url = process.env.URL


var spotifyApii = new SpotifyWebApi(credentials);

const app = express()
app.use(bodyParser.json())
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, 'views')); 

app.get('/', (req, res) => {
    res.redirect(url);
});

app.get('/login',(req,res)=>{
  var code= req.query.code || null;

  var AL,AM,AS,TL,TM,TS,dataa,recentlyPlayedTracks;
  if(code==null){
    res.redirect(url);
  }
  console.log(req.headers.authorization);
  var spotifyApi = new SpotifyWebApi(credentials);
  spotifyApii
  .authorizationCodeGrant(code)
  .then(function(data) {
    console.log('Retrieved access token', data.body['access_token']);

    // Set the access token
    spotifyApii.setAccessToken(data.body['access_token']);
    return spotifyApii.refreshAccessToken()})
  .then(
      function(data) {
        console.log('The access token has been refreshed!');
    
        // Save the access token so that it's used in future calls
        spotifyApii.setAccessToken(data.body['access_token']);
      },
      function(err) {
        console.log('Could not refresh access token', err);})
  .then(function(data){
    return spotifyApi.getMyTopArtists({limit: 5, time_range: 'long_term'});
  })
  .then(function(data) {
    AL = data.body.items
  })
  .then(function(data){
    return spotifyApi.getMyTopArtists({limit: 5, time_range: 'medium_term'});
  }).then(function(data) {
    AM = data.body.items
  })
  .then(function(data){
    return spotifyApi.getMyTopArtists({limit: 5, time_range: 'short_term'});
  })
  .then(function(data) {
    AS = data.body.items
  })
  .then(function(data){
    return spotifyApi.getMyTopTracks({limit: 5, time_range: 'medium_term'});
  }).then(function(data) {
    TM = data.body.items
  })
  .then(function(data){
    return spotifyApi.getMyRecentlyPlayedTracks({limit : 20})
  })
  .then(function(data) {
      recentlyPlayedTracks =  data.body.items
  })
  .then(function(data){
    return spotifyApi.getMyTopTracks({limit: 5, time_range: 'short_term'});
  })
  .then(function(data) {
    TS = data.body.items
  })
  .then(function(data){
    return spotifyApi.getMyTopTracks({limit: 5, time_range: 'long_term'});
  }).then(function(data) {
    TL = data.body.items
  })
  .then(function(data){
    return spotifyApi.getMe();
  })
  .then(function(data) {
    console.log('Retrieved data for ' + data.body['display_name']);
    dataa={
      name:data.body['display_name'],
      AL:AL,
      AM:AM,
      AS:AS,
      TL:TL,
      TM:TM,
      TS:TS,
      recent: recentlyPlayedTracks
    }
    // res.json(dataa);
    res.render("home.ejs",{data:dataa})
  })
  .catch(function(err) {
    console.log('Something went wrong:', err.message);
  });        
});

app.listen(process.env.PORT || 3000,()=>{
    console.log('Listening on port 3000');
});
