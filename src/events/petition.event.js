module.exports = {
    type: "message",
    callback: (client, message) => {
        if (message.author.id == client.user.id) return;
        if (message.webhookID == process.env.WEBHOOK_ID) return;
        if (/^petition/i.exec(message.cleanContent)) {
            message.react('⬆️');
            message.react('⬇️');
        }

        return void 0;
    }
}