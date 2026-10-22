import { createAudioEffectHandler } from '../lib/audio-effect.js';

export default {
    command: 'nightcore',
    aliases: [],
    category: 'audio',
    description: 'Apply a nightcore effect to replied-to audio',
    usage: '.nightcore (reply to audio)',
    handler: createAudioEffectHandler('nightcore')
};
