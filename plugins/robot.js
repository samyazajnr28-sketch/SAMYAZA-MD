import { createAudioEffectHandler } from '../lib/audio-effect.js';

export default {
    command: 'robot',
    aliases: [],
    category: 'audio',
    description: 'Apply a robot voice effect to replied-to audio',
    usage: '.robot (reply to audio)',
    handler: createAudioEffectHandler('robot')
};
