const commandHandler = {
    commands: new Map(),
    aliases: new Map(),
    disabledCommands: new Set(),
    categories: new Map(),
    toggleCommand(name) {
        const key = String(name).toLowerCase();
        if (this.disabledCommands.has(key)) this.disabledCommands.delete(key);
        else this.disabledCommands.add(key);
        return !this.disabledCommands.has(key);
    },
    findSuggestion() { return null; },
    getCommandsByCategory(category) {
        return [...this.commands.values()].filter(command => command.category === category);
    },
    getDiagnostics() {
        return { total: this.commands.size, disabled: this.disabledCommands.size };
    }
};

export default commandHandler;
