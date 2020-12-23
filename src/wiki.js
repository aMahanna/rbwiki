const fetch = require('node-fetch');
const wiki = require('wikijs').default;

async function handleSubmit(searchQuery) {
  console.log("Wiki search query: ", searchQuery);  

  const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=${searchQuery}`;
  await fetch(endpoint)
  		.then(response => response.json())
  		.then(data => {
  	  	const results = data.query.search;
        const result = results[0]; 
        this.resultTitle = result.title;
		})
    .catch(error => console.log('A Wiki Search error occurred: ', error));  
  
  console.log("title found: ", this.resultTitle);

  this.wiki = {
    title: "",
    url: "",
    image: "",
    summary: "",
    content: ""
  };
  
  this.wiki.title = this.resultTitle;
  
  /*                             Url                                  */ 
  this.wiki.url = await getWikiUrl(this.wiki.title);
  console.log("Wiki URL: ", this.wiki.url);
  
  /*                             Image                                  */ 
  this.wiki.image = await getWikiImage(this.wiki.title);
    
  /*                             Summary                                  */ 
  this.wiki.summary = await getWikiSummary(this.wiki.title); 
  
  /*                             Content                                  */ 
  this.wiki.content = await getWikiContent(this.wiki.title, this.wiki.url);  
  console.log("fin");
  return this.wiki;
}

async function getWikiUrl(resultTitle) {
  let wikiUrl = await wiki()
                  .page(resultTitle)
                  .then(page => page.url())
                  .catch(() => console.log('Error fetching wiki URL'));
  
  if (wikiUrl) {
    return wikiUrl;
  } else {
    return "unable to fetch wiki url";
  }  
}

async function getWikiInfo(resultTitle) {
  let wikiInfo = await wiki()
                  .page(resultTitle)
                  .then(page => page.info())
                  .catch(error => console.log('Error fetching wiki INFO: ', error));
  
  if (wikiInfo) {
    return wikiInfo;
  } else {
    return "unable to fetch wiki info";
  }  
}

async function getWikiSummary(resultTitle) {
  let wikiSummary = await wiki()
                      .page(resultTitle)
                      .then(page => page.summary())
                      .catch(error => console.log('Error fetching wiki SUMMARY: ', error));
  
  if (wikiSummary) {
    return shortenText(wikiSummary, 5);
  } else { 
    return "unable to fetch wiki summary (WikiJs Package uncooperative)";
  }
}

async function getWikiImage(resultTitle) {
  let wikiImageList = await wiki()
                      .page(resultTitle)
                      .then(page => page.images())
                      .catch(error => console.log('Error fetching wiki IMAGE LIST: ', error));
  
  if (wikiImageList) {
    return getValidWikiImage(wikiImageList);
  } else {
    return "unable to fetch wiki image list";
  }
}

function getValidWikiImage(wikiImageList) {
  let extension = '';
  
  for (let i = 0; i < wikiImageList.length; i++) {
    extension = wikiImageList[i].split(".").slice(-1)[0].toUpperCase(); 
    if (extension === 'JPG' || extension === 'PNG') {
      return wikiImageList[i];
    }
  }
}

async function getWikiContent(resultTitle, url) {
  let rawWikiContent = await wiki()
                      .page(resultTitle)
                      .then(page => page.content())
                      .catch(error => console.log('Error fetching wiki CONTENT: ', error));
  
  if (!rawWikiContent) {
    return "unable to fetch wiki content";
  }
  
  return parseValidWikiContent(buildValidWikiContent(rawWikiContent), url); 
}

function buildValidWikiContent(rawWikiContent) {
  let i = 0;
  let validWikiContent = [];  
  while(i < rawWikiContent.length) {
    if (
        rawWikiContent[i].title && rawWikiContent[i].content &&
        typeof rawWikiContent[i].content === 'string' &&
        rawWikiContent[i].content.length >= 200
       ) {
          validWikiContent.push(rawWikiContent[i]);
    }
    i++;
  }
  
  return validWikiContent; 
}

function parseValidWikiContent(validWikiContent, url) {
  let j = 0;
  let wikiContent = [];
  
  try {
    while (j < validWikiContent.length && j < 3) {
      wikiContent.push(
         {
           title: validWikiContent[j].title,
           content: shortenText(validWikiContent[j].content, 4),
           url: url + "#" + getWikiExtension(validWikiContent[j].title)
         }
       )
      j++;
    }
  } catch (e) {
    console.log("an error has occured establishing wiki content: ", e);
  }
  
  return wikiContent;
}

function shortenText(originalText, maxLength) {
  var summarySplit = originalText.match(/[^\.!\?]+[\.!\?]+/g);
  let i = 0;
  let shortenedText = "";
  
  if (summarySplit) {
    while(i < maxLength && summarySplit[i]) {
      shortenedText += summarySplit[i];
      i++
    }
  } else {
    shortenedText = "(no raw content to fetch)";
  }
  
  return shortenedText;
}

function getWikiExtension(title) {
  return title.split(' ').join('_');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  handleSubmit: handleSubmit
}
