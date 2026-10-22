import { createAudioEffectHandler } from '../lib/audio-effect.js';

export default {
    command: 'chipmunk',
    aliases: [],
    category: 'audio',
    description: 'Apply a chipmunk voice effect to replied-to audio',
    usage: '.chipmunk (reply to audio)',
    handler: createAudioEffectHandler('chipmunk')
};
