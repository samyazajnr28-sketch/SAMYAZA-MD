import { createAudioEffectHandler } from '../lib/audio-effect.js';

export default {
    command: 'slow',
    aliases: [],
    category: 'audio',
    description: 'Slow down replied-to audio',
    usage: '.slow (reply to audio)',
    handler: createAudioEffectHandler('slow')
};
