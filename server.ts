import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import hbs from 'hbs';
import dotenv from 'dotenv';
import multer from 'multer'
import fs from 'fs';

import apiManager from './src/apiManager';

const app = express();
app.use(cookieParser());
app.set("view engine", "hbs");
app.set("views", "views");
hbs.registerPartials(__dirname + '/views/partials/');

let upload = multer({ dest: __dirname + '/public/images/' });


let apiResponse : any;

dotenv.config();
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
  let imagePath : string = ''; 
  if (req.file && req.file.filename) {
    imagePath = '/images/' + req.file.filename; 
  } else {
    apiResponse = {
      error: true,
      errorMessage: "No image file."
    }
  }
  
  if (imagePath !== '') {
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
      fs.unlinkSync(__dirname + '/public' + imagePath);
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
function handleError(res : any, err : any) {
  console.log("\nError");
  console.log(JSON.stringify(err));
  res.redirect('/error');
}

app.get('/error', function(req, res) {
  
});

const port = process.env.PORT || 5000; 
http.createServer(app).listen(port, () => console.log(`Listening on port ${port}`));
