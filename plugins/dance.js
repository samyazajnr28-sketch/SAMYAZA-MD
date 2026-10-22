import { createInteractionHandler } from '../lib/interaction-gifs.js';

export default {
    command: 'dance',
    aliases: [],
    category: 'reaction',
    description: 'Send a dance GIF to a tagged or replied-to person',
    usage: '.dance (reply to or tag someone)',
    handler: createInteractionHandler('dance')
};
