import { store } from '../storage.js';

export async function setCommandReactState(enabled) {
    await store.saveSetting('global', 'commandReactions', Boolean(enabled));
}

export async function getCommandReactState() {
    return Boolean(await store.getSetting('global', 'commandReactions'));
}
