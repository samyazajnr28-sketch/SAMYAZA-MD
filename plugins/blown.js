import { createAudioEffectHandler } from '../lib/audio-effect.js';

export default {
    command: 'blown',
    aliases: [],
    category: 'audio',
    description: 'Add a blown-speaker effect to replied audio',
    usage: '.blown (reply to audio)',
    handler: createAudioEffectHandler('blown')
};
