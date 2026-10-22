import { createInteractionHandler } from '../lib/interaction-gifs.js';

export default {
    command: 'wave',
    aliases: [],
    category: 'reaction',
    description: 'Send a wave GIF to a tagged or replied-to person',
    usage: '.wave (reply to or tag someone)',
    handler: createInteractionHandler('wave')
};
