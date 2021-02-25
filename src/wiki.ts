import fetch from 'node-fetch';
import wiki from 'wikijs';

async function handleSubmit(this : any, searchQuery :any) {
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

async function getWikiUrl(resultTitle : any) {
  let wikiUrl = await wiki()
                  .page(resultTitle)
                  .then((page : any) => page.url())
                  .catch(() => console.log('Error fetching wiki URL'));
  
  if (wikiUrl) {
    return wikiUrl;
  } else {
    return "unable to fetch wiki url";
  }  
}

async function getWikiInfo(resultTitle : any) {
  let wikiInfo = await wiki()
                  .page(resultTitle)
                  .then((page : any) => page.info())
                  .catch((error : any) => console.log('Error fetching wiki INFO: ', error));
  
  if (wikiInfo) {
    return wikiInfo;
  } else {
    return "unable to fetch wiki info";
  }  
}

async function getWikiSummary(resultTitle : any) {
  let wikiSummary = await wiki()
                      .page(resultTitle)
                      .then((page : any) => page.summary())
                      .catch((error : any) => console.log('Error fetching wiki SUMMARY: ', error));
  
  if (wikiSummary) {
    return shortenText(wikiSummary, 5);
  } else { 
    return "unable to fetch wiki summary (WikiJs Package uncooperative)";
  }
}

async function getWikiImage(resultTitle : any) {
  let wikiImageList = await wiki()
                      .page(resultTitle)
                      .then((page : any) => page.images())
                      .catch((error : any) => console.log('Error fetching wiki IMAGE LIST: ', error));
  
  if (wikiImageList) {
    return getValidWikiImage(wikiImageList);
  } else {
    return "unable to fetch wiki image list";
  }
}

function getValidWikiImage(wikiImageList : any) {
  let extension = '';
  
  for (let i = 0; i < wikiImageList.length; i++) {
    extension = wikiImageList[i].split(".").slice(-1)[0].toUpperCase(); 
    if (extension === 'JPG' || extension === 'PNG') {
      return wikiImageList[i];
    }
  }
}

async function getWikiContent(resultTitle : any, url : any) {
  let rawWikiContent = await wiki()
                      .page(resultTitle)
                      .then((page : any) => page.content())
                      .catch((error : any) => console.log('Error fetching wiki CONTENT: ', error));
  
  if (!rawWikiContent) {
    return "unable to fetch wiki content";
  }
  
  return parseValidWikiContent(buildValidWikiContent(rawWikiContent), url); 
}

function buildValidWikiContent(rawWikiContent : any) {
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

function parseValidWikiContent(validWikiContent : any, url : any) {
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

function shortenText(originalText : any, maxLength : any) {
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

function getWikiExtension(title : any) {
  return title.split(' ').join('_');
}

function sleep(ms : any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export default handleSubmit; 
