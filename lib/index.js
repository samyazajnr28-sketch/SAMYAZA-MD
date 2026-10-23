import { store } from '../storage.js';

const get = (namespace, key, fallback = null) => store.getSetting(namespace, key).then(value => value ?? fallback);
const save = (namespace, key, value) => store.saveSetting(namespace, key, value).then(() => value);

export const getAntitag = (chatId) => get(chatId, 'antitag');
export const setAntitag = (chatId, _mode, action = 'delete') => save(chatId, 'antitag', { enabled: true, action });
export const removeAntitag = chatId => save(chatId, 'antitag', { enabled: false });

export const getChatbot = chatId => get(chatId, 'chatbot', { enabled: false });
export const getWelcome = chatId => get(chatId, 'welcome');
export const getGoodbye = chatId => get(chatId, 'goodbye');
export const isWelcomeOn = async chatId => Boolean((await getWelcome(chatId))?.enabled);
export const isGoodByeOn = async chatId => Boolean((await getGoodbye(chatId))?.enabled);

export const getSudoList = () => get('global', 'sudoUsers', []);
export const addSudo = async jid => {
    const users = await getSudoList();
    if (!users.includes(jid)) users.push(jid);
    await save('global', 'sudoUsers', users);
    return true;
};
export const removeSudo = async jid => {
    const users = (await getSudoList()).filter(item => item !== jid);
    await save('global', 'sudoUsers', users);
    return true;
};
