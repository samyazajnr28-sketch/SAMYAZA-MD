import { createAudioEffectHandler } from '../lib/audio-effect.js';

export default {
    command: 'earrape',
    aliases: [],
    category: 'audio',
    description: 'Apply a loud effect to replied-to audio',
    usage: '.earrape (reply to audio)',
    handler: createAudioEffectHandler('earrape')
};
