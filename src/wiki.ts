import fetch from 'node-fetch';
import wiki from 'wikijs';

async function handleSubmit(this : any, searchQuery :any) {
  console.log("Wiki search query: ", searchQuery);  

  const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=${searchQuery}`;
  const wikiResponse = await fetch(endpoint);
  const wikiJSON = await wikiResponse.json();
  const result = wikiJSON.query.search[0];
  
  const wikiObject = await getWiki(result.title);

  console.log("fin");
  return wikiObject; 
}

async function getWiki(resultTitle : any) {
  let url = await wiki().page(resultTitle).then((page : any) => page.url()).catch(() => console.log('Error fetching wiki URL'));
  let summary = await wiki().page(resultTitle).then((page : any) => page.summary()).catch((error : any) => console.log('Error fetching wiki SUMMARY: ', error));
  let imageList = await wiki().page(resultTitle).then((page : any) => page.images()).catch((error : any) => console.log('Error fetching wiki IMAGE LIST: ', error));
  let image = getValidWikiImage(imageList);
  let content = await wiki().page(resultTitle).then((page : any) => page.content()).catch((error : any) => console.log('Error fetching wiki CONTENT: ', error));
  summary = summary ? shortenText(summary, 5) : undefined; 
  content = content ? parseValidWikiContent(buildValidWikiContent(content), url) : undefined;  

  return {
    title: resultTitle, 
    url: url ? url : "Error Fetching Wiki URL",
    summary: summary ? summary : "Error Fetching Summary",
    image: image ? image : "Error Fetching Image",
    content: content ? content : "Error fetching Wiki Content"
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
           url: url + "#" + validWikiContent[j].title.split(' ').join('_')
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

function sleep(ms : any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default handleSubmit; 