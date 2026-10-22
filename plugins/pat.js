import { createInteractionHandler } from '../lib/interaction-gifs.js';

export default {
    command: 'pat',
    aliases: [],
    category: 'reaction',
    description: 'Send a head-pat GIF to a tagged or replied-to person',
    usage: '.pat (reply to or tag someone)',
    handler: createInteractionHandler('pat')
};
