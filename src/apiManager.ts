import requestPromise from 'request-promise';

import getGcpOptions from './googleVision'; 
import handleSubmit from './wiki'; 
import ignoredWords from './ignoredWords'; 

// Data gets passed through googleVision and wiki calls
// imagePath is the url of the image on the server
async function askGoogleVision(data : any, imagePath : string) {
  
  let gcpOptions : any;
  let gvGuess : any;
  
  try {
    gcpOptions = await getGcpOptions('./public' + imagePath);
    console.log('2.1) request options');
    gvGuess = await requestPromise(gcpOptions);
    
  } catch (err) {
    data.error = true;
    data.errorMessage = "Unable to fetch google vision guess";
  }
  
  data.gvGuess = gvGuess;
  console.log('3) GVGuess: ', gvGuess);
  checkGoogleVisionGuess(data);
}

// Gets the "best guess" from the Google Vision response object
// Splits the string into an array to check for words we want to remove
// ignoredWords.js has a list of words that should be removed (like 'vinyl')
function checkGoogleVisionGuess(data : any) {
  data.gvBestGuess = data.gvGuess.responses[0].webDetection.bestGuessLabels[0].label;
  if (!data.gvBestGuess) {
    throw('No guess from google');
    return;
  }
  
  ignoredWords.forEach(function(word : any) {
    if (data.gvBestGuess.includes(word)) {
      data.gvBestGuess = data.gvBestGuess.replace(word, "");
    }
  })
  console.log('4) Passed Check');
  return data;   
}

async function askMediaWiki(data : any) {
  data.wiki = await handleSubmit(data.gvBestGuess.trim());
  console.log('5) Passed wiki');
  return data;
}

async function apiManager(imagePath : string, req : any, res : any) {
  let data : any = {};
  
  console.log('1)apiManager');
  try {
    await askGoogleVision(data, imagePath);
    await askMediaWiki(data);
    
  } catch (err) {
    data.error = true;
    data.errorMessage = err;
  }
  
  data.error = false;
  console.log('6) returning data...');
  return data; 
}

export default apiManager;