import { createAudioEffectHandler } from '../lib/audio-effect.js';

export default {
    command: 'fast',
    aliases: [],
    category: 'audio',
    description: 'Speed up replied-to audio',
    usage: '.fast (reply to audio)',
    handler: createAudioEffectHandler('fast')
};
