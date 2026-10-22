import { createAudioEffectHandler } from '../lib/audio-effect.js';

export default {
    command: 'audioreverse',
    aliases: [],
    category: 'audio',
    description: 'Reverse replied-to audio',
    usage: '.audioreverse (reply to audio)',
    handler: createAudioEffectHandler('audioreverse')
};
