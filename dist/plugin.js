"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppleMusic = void 0;
const cheerio = require("cheerio");
const axios = require("axios");
const erela_js_1 = require("erela.js");
const axios_1 = __importDefault(require("axios"));

const REGEXTRACK = /(http(s|):\/\/music\.apple\.com\/..\/.....\/.*\/([0-9]){1,})\?i=([0-9]){1,}/gmi
const REGEX = /(?:https:\/\/music\.apple\.com\/)(?:\w{2}\/)?(track|album|playlist)/g;
const buildSearch = (loadType, tracks, error, name) => ({
    loadType: loadType,
    tracks: tracks !== null && tracks !== void 0 ? tracks : [],
    playlist: name ? {
        name,
        duration: tracks
            .reduce((acc, cur) => acc + (cur.duration || 0), 0),
    } : null,
    exception: error ? {
        plugin: `AppleMusic`,
        message: error,
        severity: "COMMON"
    } : null,
});
const check = (options) => {
    if (typeof options.convertUnresolved !== "undefined" &&
        typeof options.convertUnresolved !== "boolean")
        throw new TypeError('AppleMusic option "convertUnresolved" must be a boolean.');
    if (typeof options.playlistLimit !== "undefined" &&
        typeof options.playlistLimit !== "number")
        throw new TypeError('AppleMusic option "playlistLimit" must be a number.');
    if (typeof options.albumLimit !== "undefined" &&
        typeof options.albumLimit !== "number")
        throw new TypeError('AppleMusic option "albumLimit" must be a number.');
};
class AppleMusic extends erela_js_1.Plugin {
    constructor(options = {}) {
        super();
        check(options);
        this.options = {
            playlistLimit: options.playlistLimit && options.playlistLimit >= 1 ? options.playlistLimit : 100,
            albumLimit: options.albumLimit && options.albumLimit >= 1 ? options.albumLimit : 50,
            convertUnresolved: options.convertUnresolved ? options.convertUnresolved : false
        };
       
        this.functions = {
            track: this.getTrack.bind(this),
            album: this.getAlbumTracks.bind(this),
            playlist: this.getPlaylistTracks.bind(this),
        };
    };
    load(manager) {
        this.manager = manager;
        this._search = manager.search.bind(manager);
    
        manager.search = this.search.bind(this);
    }
    search(query, requester) {
      
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const finalQuery = query.query || query;
            let AppleURL = finalQuery.match(REGEX)
            let tipo = AppleURL ? typeSong(query) : []
            if(tipo && finalQuery.match(REGEXTRACK)) tipo = `track`
       
            if (tipo in this.functions) {
                try {
                    const func = this.functions[tipo];
                    if (func) {
                        const data = yield func(query);
                        const loadType = tipo === "track" ? "TRACK_LOADED" : "PLAYLIST_LOADED";
                        const name = ["playlist", "album"].includes(tipo) ? data.name : null;
                        if(!data || !data.tracks || !data.tracks[0]) return buildSearch('NO_MATCHES', null, null, null);
                        const tracks = data.tracks.map(query => {
                            const track = erela_js_1.TrackUtils.buildUnresolved(query, requester);
                            if (this.options.convertUnresolved)
                                track.resolve();
                            return track;
                        });
                        return buildSearch(loadType, tracks, null, name);
                    }
                    const msg = 'Incorrect type for AppleMusic URL, must be one "track of album","album" or "playlist".';
                    return buildSearch("LOAD_FAILED", null, msg, null);
                } catch (e) {
                    
                    return buildSearch((_b = e.loadType) !== null && _b !== void 0 ? _b : "LOAD_FAILED", null, (_c = e.message) !== null && _c !== void 0 ? _c : null, null);
                };
            };
            return this._search(query, requester);
        });
    };
    getAlbumTracks(url) {
        
        return __awaiter(this, void 0, void 0, function* () {
            let x = axios.get(url)
            let s = yield x
              let $ = cheerio.load(s.data),
              Title = $(".songs-list-row__song-name").toArray(),
              Artist = $(".dt-link-to").toArray(),
              Album = $(".product-name").toArray(),
              Otro =  $(`.songs-list-row__link`).toArray(),
              Playlist = []
        
        
            
              let Alterno = Otro[0] ? Otro[0].children[2].prev.data : 'No existe capo'
              let artista = Artist[0] ? Artist[0].children[1].data : Alterno
              let i = 0
              for(i; i < Title.length; i++){
               Playlist.push({
                  
                   title: Title[i].lastChild.prev.data,
                   uri: url,
                   album: Album[0].children[4].data.replace(/ /g, "").replace(/\n/g, ""),
                   artist: `${artista}`,
              
                   
               });
              }
            
                     
               let data = Playlist
            
                 let titulo = Album[0].children[4].data.replace(/ /g, "").replace(/\n/g, "")
                
               
            const tracks = data.map(item => AppleMusic.convertToUnresolved(item));
            return { tracks: tracks.splice(0, this.options.albumLimit), name: titulo };
        });
    };
    getPlaylistTracks(url) {
        
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield ApplePlayList(url)
            let PlaylistName = Titulo(url)
          
            const tracks = res.map(item => AppleMusic.convertToUnresolved(item));
            return { tracks: tracks.splice(0, this.options.playlistLimit), name: PlaylistName };
        });
    };
    getTrack(url) {
      
        return __awaiter(this, void 0, void 0, function* () {
            const title = replaceTexto(url)
  
 
         
             let x = axios.get(url).then(res => {
             
               let $ = cheerio.load(res.data),
               Title = $(".songs-list-row__song-name").toArray(),
               Artist = $(".dt-link-to").toArray(),
               Otro =  $(`.songs-list-row__link`).toArray()
          
               var i = 0
               let Alterno = Otro[0] ? Otro[0].children[2].prev.data : 'No existe capo'
               let artista = Artist[0] ? Artist[0].children[1].data : Alterno
               try{
                 
                 while(Title[i].lastChild.prev.data.toLowerCase().replace("¡", "").replace("!", "").replace(`'`, '').replace("¿", '').replace("?", '') !== title.toLowerCase()){
                   i++
                   
                 }
                 let objectTrack = {
                    artist: `${artista}`,
                    uri: url,
                    title:`${Title[i].lastChild.prev.data} ${artista}`
                 }
                 return objectTrack
               } catch (e) {
                let objectTrackErr = {
                    artist: `${artista}`,
                    uri: url,
                    title:`${Title[0].lastChild.prev.data} ${artista}`
                 }
                 return  objectTrackErr
               }
              
             
             
             })
                
            let data = yield x
          
            const track = AppleMusic.convertToUnresolved(data);
            return { tracks: [track] };
        });
    };
    static convertToUnresolved(track) {
    
        if (!track)
            throw new ReferenceError("The Apple track object was not provided");
        if (!track.artist)
            throw new ReferenceError("The track artist array was not provided");
        if (!track.title)
            throw new ReferenceError("The track title was not provided");
        if (typeof track.title !== "string")
            throw new TypeError(`The track title must be a string, received type ${typeof track.name}`);

            
        return {
            title: track.title,
            author: track.artist,
            uri: track.uri,
            duration: getRandom(140, 250) * 1000,
        };
    }
};
function typeSong(url) {
    
    let res = url.replace(/https:\/\//i,'').split('/')[2]
    return res
     
}
function Titulo(title){
    let first = title.replace(/https:\/\//i,'').split('/')[3]
    let text = first.replace(/-/g, " ").split(" ")
    let coso = '';
    for (let i of text) {
    coso+=i.slice(0,1).toUpperCase() +i.slice(1) + ' '
    }
    return coso
    }
    function getRandom(min, max) {
        return Math.random() * (max - min) + min;
      }
 function replaceTexto(texto) {
     let nuevo = texto.replace(/https:\/\//i,'').split('/')[3].replace(/-/g, " ").replace(/%C3%B3/g, "ó").replace(/%C3%A9/g, "é").replace(/%C3%BA/g, "ú").replace(/%C3%AD/g, "í").replace(/%C3%A1/g, "á").replace(/%C3%B1/g, "ñ")
     return nuevo
 }  
 
  /**
     * Get the apple music playlist and returns an array of objects with an album, artist and title property
     * @param {string} url The url to the apple music playlist
     * @return {Promise<object[]>} The playlist array
     */
   function ApplePlayList(url) {
    return new Promise((resolve, reject) => {
        if (!url) {
            reject(new Error("Playlist url is undefined"));
        } else {
            axios.get(url).then(res => {
                let $ = cheerio.load(res.data),
						aTitleDivs = $('div[data-testid=track-title][dir=auto].songs-list-row__song-name').toArray(),
						aArtistDivs = $("div[data-testid=track-column-secondary].songs-list__col--secondary > .songs-list__song-link-wrapper").toArray(),
						aAlbumDivs = $("div[data-testid=track-column-tertiary].songs-list__col--tertiary > .songs-list__song-link-wrapper > span > a").toArray(),
						aPlaylist = [],
						i,
						j = 0;
						
					for (i = 0; i < aTitleDivs.length; i++) {
						
						aPlaylist.push({
							album: aAlbumDivs[j].children[0].data,
							artist: aArtistDivs[j].children[1].children[0].children[0].data,
							title: aTitleDivs[i].children[0].data
						});
						j += 1;
					}

                resolve(aPlaylist);
            }).catch(err => {
                reject(err);
            });
        }
    });
}
 exports.AppleMusic = AppleMusic;
