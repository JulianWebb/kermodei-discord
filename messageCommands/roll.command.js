module.exports = {
    identifier: "roll",
    permission: "USE_COMMANDS",
    syntax: "roll [numberOfDice]d[numberofSides]",
    description: "Use to roll a set of virtual dice. Uses only basic notation, e.g. (XdY).",
    trigger: (testString) => /^roll\s\d+d\d+.*/i.test(testString.slice(1)),
    command: (_, message) => {
        let values = /^roll\s(\d+)d(\d+).*/gi.exec(message.cleanContent.slice(1));
        let count = values[1];
        let sides = values[2];
        let results = [];
        for (let i = 0;i < count;i++) {
            results.push(Math.floor(Math.random() * (sides - 1) + 1));
        }
        let total = results.reduce((accumulator, current) => accumulator + current, 0);
        let response = `Rolled a d${sides} ${count} times: ${results.toString().replace(/,/g, '+')}=${total}`;
        message.channel.send(response);
    }
}