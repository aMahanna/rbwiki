# Rube's Wiki

This is a <a href="https://en.wikipedia.org/wiki/Rube_Goldberg_machine">Rube Goldberg Machine</a> of the <a href="https://cloud.google.com/vision/">Google Cloud Vision API</a> and the <a href="https://www.mediawiki.org/wiki/API:Main_page">MediaWiki API</a>. After uploading an image, the data will be sent to the Google Vision API, which will fetch the most relevant key words associated to that image. The app will then search Wikipedia using Google's result, and give you the first condensed Wiki page for a quick read.

In theory, this can also work with other things like a book cover for example (assuming there is a Wikipedia page for it). It doesn't have to be LP record albums, but use at your own risk.

You will need the following to make your own:

- [Google Cloud API Key](https://cloud.google.com/docs/authentication/api-keys) (this is set as GCP_API_KEY ENV variable)
