# RBWiki

A <a href="https://en.wikipedia.org/wiki/Rube_Goldberg_machine">Rube Goldberg Machine</a> for accessing condensed Wikipedia page content through photo recognition. 

A live demo can be found [here](https://rubeswiki.glitch.me/).

Built with Express, using Javscript, HTML, CSS, Handlebars, and the Google Cloud Vision & MediaWiki APIs.

It was originally intended for taking pictures of LP Records and getting condensed Wiki info about their album & band, but it can work with other things, like a book cover or a famous face. 

<p align="center">
  <img src="imgs/menu.png">
</p>

To run:
- You will need a [Google Cloud API Key](https://cloud.google.com/docs/authentication/api-keys) (set as GCP_API_KEY in your `.env`)
- `yarn install`
- `yarn build`
- `yarn dev`