module.exports = {
    identifier: "ping",
    permission: "USE_COMMANDS",
    syntax: "ping [message]",
    description: "Used to test status of bot, will repeat back any message added to command.",
    trigger: (testString) => /^ping/i.test(testString.slice(1)),
    command: (_, message) => {
        let values = /^ping\s(.*)/gi.exec(message.cleanContent.slice(1));
        message.channel.send(`Pong: ${values[1]}`);
    }
}