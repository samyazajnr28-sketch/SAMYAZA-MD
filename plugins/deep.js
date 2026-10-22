import { createAudioEffectHandler } from '../lib/audio-effect.js';

export default {
    command: 'deep',
    aliases: [],
    category: 'audio',
    description: 'Lower the pitch of replied-to audio',
    usage: '.deep (reply to audio)',
    handler: createAudioEffectHandler('deep')
};
