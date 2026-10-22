const helpMessages = {
    noCommands: '❌ No commands are available.',
    greeting: 'Hello',
    owner: 'Owner',
    prefix: 'Prefix',
    time: 'Time',
    date: 'Date',
    timezone: 'Timezone',
    noDescription: 'No description available.',
    aliases: 'Aliases',
    usage: 'Usage:',
    powered: 'Powered by',
    error: '❌ Error loading help.'
};

export async function t(_jid, _section, key) {
    return helpMessages[key] || key;
}
