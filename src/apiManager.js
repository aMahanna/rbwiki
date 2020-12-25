var requestPromise = require('request-promise');

const googleVision = require('./googleVision');
const wiki = require('./wiki');
const ignoredWords = require('./ignoredWords');


// Data gets passed through googleVision and wiki calls
// imagePath is the url of the image on the server
async function askGoogleVision(data, imagePath, mimetype) {
  
  let gcpOptions;
  let gvGuess;
  
  try {
    gcpOptions = await googleVision.getGcpOptions('./public' + imagePath);
    gvGuess = await requestPromise(gcpOptions);
    
  } catch (err) {
    data.error = true;
    data.errorMessage = "Unable to fetch google vision guess";
  }
  
  data.gvGuess = gvGuess;
  checkGoogleVisionGuess(data);
}

// Gets the "best guess" from the Google Vision response object
// Splits the string into an array to check for words we want to remove
// ignoredWords.js has a list of words that should be removed (like 'vinyl')
function checkGoogleVisionGuess(data) {
  data.gvBestGuess = data.gvGuess.responses[0].webDetection.bestGuessLabels[0].label;
  if (!data.gvBestGuess) {
    throw('No guess from google');
    return;
  }
  
  ignoredWords.ignoredWords.forEach(function(word) {
    if (data.gvBestGuess.includes(word)) {
      data.gvBestGuess = data.gvBestGuess.replace(word, "");
    }
  })
  
  return data;   
}

async function askMediaWiki(data) {
  data.wiki = await wiki.handleSubmit(data.gvBestGuess.trim());
  return data;
}

async function apiManager(imagePath, req, res) {
  let data = {};
  
  try {
    await askGoogleVision(data, imagePath);
    await askMediaWiki(data);
    
  } catch (err) {
    data.error = true;
    data.errorMessage = err;
  }
  
  data.error = false;
  return data; 
}

module.exports = apiManager;