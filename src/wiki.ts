import fetch from 'node-fetch';
import wiki from 'wikijs';

interface wikiObject {
  title: string;
  url: string | URL;
  summary: string;
  image: string;
  content: string | {
      title: any;
      content: string;
      url: string;
  }[];
}

/**
 * Calls the MediaWiki api to fetch the closes title
 * Uses WikiJS to fetch Wiki page info for that article
 * Returns it as a wiki object
 * @param searchQuery Google Vision's best guess
 * @returns 
 */
async function handleSubmit(searchQuery :any) : Promise<wikiObject> {
  console.log("Wiki search query: ", searchQuery);  

  const wikiResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=${searchQuery}`);
  const wikiJSON = await wikiResponse.json();
  const result = wikiJSON.query.search[0];
  
  const wikiObject = await getWiki(result.title);

  return wikiObject; 
}

async function getWiki(resultTitle : string) {
  const page = await wiki().page(resultTitle);
  const summary = await page.summary();
  const imageList = await page.images();
  const content = await page.content();
  const url = page.url();

  const validImage = getValidWikiImage(imageList);
  const shortenedSummary = summary ? shortenText(summary, 5) : undefined; 
  const parsedContent = content ? parseValidWikiContent(buildValidWikiContent(content), url) : undefined;  
  
  return {
    title: resultTitle, 
    url: url ? url : "Error Fetching Wiki URL",
    summary: shortenedSummary ? shortenedSummary : "Error Fetching Summary",
    image: validImage ? validImage : "Error Fetching Image",
    content: parsedContent ? parsedContent : "Error fetching Wiki Content"
  }
}

function getValidWikiImage(wikiImageList : string[]) : string | undefined {
  let extension = '';
  for (let i = 0; i < wikiImageList.length; i++) {
    extension = wikiImageList[i].split(".").slice(-1)[0].toUpperCase(); 
    if (extension === 'JPG' || extension === 'PNG' || extension === 'SVG') {
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

export default handleSubmit; 