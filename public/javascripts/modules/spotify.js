function getSpotifyData(input, id, url) {
	const request = require('request'); // "Request" library
	console.log(input, id, url)
	if(!input) {
		return
	}

var client_id = process.env.SPOT_KEY; // Your client id
var client_secret = process.env.SPOT_SECRET; // Your secret

// your application requests authorization
var authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};

request.post(authOptions, function(error, response, body) {
  if (!error && response.statusCode === 200) {

    // use the access token to access the Spotify Web API
    var token = body.access_token;
    var options = {
      url: `https://api.spotify.com/v1/search?q=${band.name}&type=artist&limit=5`,
      headers: {
        'Authorization': 'Bearer ' + token
      },
      json: true
    };
    request.get(options, function(error, response, body) {
      console.log(body.artists.items);
    });
  }
});

}

export default getSpotifyData;