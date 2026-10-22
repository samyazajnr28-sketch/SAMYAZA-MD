import { createAudioEffectHandler } from '../lib/audio-effect.js';

export default {
    command: 'fat',
    aliases: [],
    category: 'audio',
    description: 'Apply the fat voice effect to replied-to audio',
    usage: '.fat (reply to audio)',
    handler: createAudioEffectHandler('fat')
};
