module.exports = {
    identifier: "ping",
    permission: "USE_COMMANDS",
    trigger: (testString) => /^ping/i.test(testString.slice(1)),
    command: (_, message) => {
        let values = /^ping\s(.*)/gi.exec(message.cleanContent.slice(1));
        message.channel.send(`Pong: ${values[1]}`);
    }
}