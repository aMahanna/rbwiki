import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import hbs from 'hbs';
import dotenv from 'dotenv';
import multer from 'multer'
import fs from 'fs';

import apiHandler from './src/apiHandler';

const app = express();
app.use(cookieParser());
app.set("view engine", "hbs");
app.set("views", "views");
hbs.registerPartials(__dirname + '/views/partials/');

dotenv.config();

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('intro', {});
});
app.get('/about', (req, res) => {
  res.render('about', {});
});
app.get('/error', function(req, res) {
  res.render('error', {});
});

let apiResponse : any;
const upload = multer({ dest: __dirname + '/public/images/' });
app.post('/content', upload.single('file'), async function(req, res) {
  if (req.file && req.file.filename) {
    const imagePath : string = '/images/' + req.file.filename; 
    try {
      apiResponse = await apiHandler(imagePath, req, res);
      fs.unlinkSync(__dirname + '/public' + imagePath);
    } catch(e) {
      apiResponse = {
        error: true,
        errorMessage: "API requests failed."
      }
    }
  }

  if (!apiResponse.error)
    res.sendStatus(200);
  else
    res.redirect('/error');
});

app.get('/content', function(req, res) {
  res.render('content', {
    wiki: apiResponse.wiki,
    googleVisionGuess: apiResponse.gvBestGuess
  })
});

const port = process.env.PORT || 5000; 
http.createServer(app).listen(port, () => console.log(`Listening on http://localhost:${port}`));
