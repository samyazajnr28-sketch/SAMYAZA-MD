import { createAudioEffectHandler } from '../lib/audio-effect.js';

export default {
    command: 'bass',
    aliases: [],
    category: 'audio',
    description: 'Boost bass on a replied-to voice note or audio clip',
    usage: '.bass (reply to audio)',
    handler: createAudioEffectHandler('bass')
};
