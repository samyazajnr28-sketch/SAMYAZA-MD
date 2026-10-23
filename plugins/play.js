import songCommand from './song.js';

// Keep `.play` as the familiar music command, but use the same MP3
// downloader as `.song` instead of returning only a YouTube search result.
export default {
    ...songCommand,
    command: 'play',
    aliases: ['plays', 'music'],
    category: 'download',
    description: 'Search for and download a song from YouTube as MP3',
    usage: '.play <song name | youtube link>'
};
