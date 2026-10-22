import { createInteractionHandler } from '../lib/interaction-gifs.js';

export default {
    command: 'highfive',
    aliases: [],
    category: 'reaction',
    description: 'Send a high-five GIF to a tagged or replied-to person',
    usage: '.highfive (reply to or tag someone)',
    handler: createInteractionHandler('highfive')
};
