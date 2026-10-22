import { createInteractionHandler } from '../lib/interaction-gifs.js';

export default {
    command: 'cuddle',
    aliases: [],
    category: 'reaction',
    description: 'Send a cuddle GIF to a tagged or replied-to person',
    usage: '.cuddle (reply to or tag someone)',
    handler: createInteractionHandler('cuddle')
};
