module.exports = {
    identifier: "listRoles",
    permission: "MANAGE_USER",
    syntax: "prune [numberOfMessages]",
    description: "prunes messages from the channel the command is used in starting from newest first. Limit 100 messages.",
    trigger: (testString) => /^prune\s\d+/i.test(testString.slice(1)),
    command: (client, message) => {
        let amount = Number.parseInt(/^prune\s(\d+)/gi.exec(message.cleanContent.slice(1))[1]) + 1;
        amount = amount < 100? amount: 100;
        client.logger.log(`Pruning ${amount} messages from ${message.channel.name}`)
        message.channel.messages.fetch({ limit: amount })
            .then(messages => {
                messages.each(messageToDelete => {
                    messageToDelete.delete();
                });
            })
    }
}