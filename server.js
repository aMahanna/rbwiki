var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();
const hbs = require("hbs");
app.use(cookieParser());
app.set("view engine", "hbs");
app.set("views", "views");
hbs.registerPartials(__dirname + '/views/partials/');

var multer  = require('multer');
var upload = multer({ dest: __dirname + '/public/images/' });
const querystring = require('querystring');
const url = require('url');
const fs = require('fs');
const uuidv4 = require('uuid/v4');

const projectUrl = 'https://' + process.env.PROJECT_DOMAIN + '.glitch.me';
const apiManager = require('./apiManager');

var apiResponse;

/* Routes */

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('intro', {});
});

// Camera is default view
app.get('/about', (req, res) => {
  res.render('about', {});
});

// This route works for both the async request from the frontend
// or as a form submittion if the fancy uploader doesn't work (no js).
// At the end the image is deleted from the server
app.post('/content', upload.single('file'), async function(req, res) {
  var imagePath = false;
  if (req.file && req.file.filename) {
    imagePath = '/images/' + req.file.filename; 
  } else {
    apiResponse = {
      error: true,
      errorMessage: "No image file."
    }
  }
  
  if (imagePath) {
    try {
      apiResponse = await apiManager(imagePath, req, res);
    } catch(e) {
      apiResponse = {
        error: true,
        errorMessage: "API requests failed."
      }
    }
  }
  
  if (!apiResponse.error) {
    if (req.body.async) {
      res.json({
        error: false,
        googleVisionGuess: apiResponse.gvBestGuess,
      });
    } else {
      res.render('content', {
        googleVisionGuess: apiResponse.gvBestGuess,
        analyticsUrl: process.env.ANALYTICS_URL
      });
    }
  } else {
    if (req.body.async) {
      res.json({
        error: true,
        errorMessage: apiResponse.errorMessage
      });
    } else {
      handleError(res, "Error: " + apiResponse.errorMessage);
    }
  }
  if (imagePath) {
    try {
      fs.unlinkSync('/app/public' + imagePath);
    } catch (err) {
      console.log('error deleting ' + imagePath + ': ' + err);
    }
  }

});

// Once the async apiManager request returns, frontend redirects to content
app.get('/content', function(req,res) {
  if (req.query.googleVisionGuess) {
    res.render('content', {
      background: apiResponse.wiki.image,
      wikiTitle: apiResponse.wiki.title,
      wikiUrl: apiResponse.wiki.url,
      wikiInfo: apiResponse.wiki.info,
      wikiSummary: apiResponse.wiki.summary,
      wikiContent: apiResponse.wiki.content,
      googleVisionGuess: req.query.googleVisionGuess,
      analyticsUrl: process.env.ANALYTICS_URL
    })
  } else {
    res.redirect('/');
  }
  
});

// General error handling
function handleError(res, err) {
  console.log("\nError");
  console.log(JSON.stringify(err));
  res.redirect('/error');
}

app.get('/error', function(req, res) {
  
});

var listener = app.listen(process.env.PORT, function () {
  console.log('app is listening on port ' + listener.address().port);
});
