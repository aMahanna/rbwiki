# rbwiki

[![Render](https://img.shields.io/badge/Render-%46E3B7.svg?style=for-the-badge&logo=render&logoColor=white)](https://rbwiki.mahanna.dev/)
[![Last commit](https://img.shields.io/github/last-commit/aMahanna/rbwiki)](https://github.com/aMahanna/rbwiki/commits/main)

A <a href="https://en.wikipedia.org/wiki/Rube_Goldberg_machine">Rube Goldberg Machine</a> for accessing condensed Wikipedia page content through photo recognition. 

A live demo can be found [here](https://rbwiki.mahanna.dev/).

Built with Express, using Typescript, JQuery, Handlebars, HTML, CSS, and the Google Cloud Vision & MediaWiki APIs.

It was originally intended for taking pictures of LP Records and getting condensed Wiki info about their album & band, but it can work with other things, like a book cover or a famous face. 

<p align="center">
  <img src="imgs/menu.png">
</p>

To run:
- You will need a [Google Cloud API Key](https://cloud.google.com/docs/authentication/api-keys) (set as GCP_API_KEY in your `.env`)
- `yarn install`
- `yarn build`
- `yarn dev`
