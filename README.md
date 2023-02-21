<hr>
</div>
Working Apple Music plugin for Erela.JS

Note: Erela.JS has lost support, however many people still rely on the library in order to create their own Discord Bots. I have forked and updated the scrapping script in order to have Apple Music playlists work with Erela JS again. 

## What is this ?
This a plugin for Erela.JS to allow the use of AppleMusic URL's, it uses direct URL's being tracks, albums, and playlists and gets the YouTube equivalent.  


- https://music.apple.com/mx/album/happier-than-ever/1564530719

- https://music.apple.com/es/album/anymore/1444563557?i=1444563560

- https://music.apple.com/us/playlist/todays-hits/pl.f4d106fed2bd41149aaacabb233eb5eb
## Installation

**NPM** :

`npm install erela.js-apple`
## Example Usage

```javascript
const { Manager } = require("erela.js");
const AppleMusic  = require("erela.js-apple");

const manager = new Manager({
  plugins: [
    // Initiate the plugin 
    new AppleMusic()
  ]
});

manager.search("https://music.apple.com/mx/album/happier-than-ever/1564530719");
```
