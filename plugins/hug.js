import { createInteractionHandler } from '../lib/interaction-gifs.js';

export default {
    command: 'hug',
    aliases: [],
    category: 'reaction',
    description: 'Send a hug GIF to a tagged or replied-to person',
    usage: '.hug (reply to or tag someone)',
    handler: createInteractionHandler('hug')
};
