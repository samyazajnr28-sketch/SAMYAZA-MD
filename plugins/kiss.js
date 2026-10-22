import { createInteractionHandler } from '../lib/interaction-gifs.js';

export default {
    command: 'kiss',
    aliases: [],
    category: 'reaction',
    description: 'Send a kiss GIF to a tagged or replied-to person',
    usage: '.kiss (reply to or tag someone)',
    handler: createInteractionHandler('kiss')
};
