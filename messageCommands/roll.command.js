module.exports = {
    identifier: "roll",
    trigger: (testString) => /^roll\s\d+d\d+.*/i.test(testString.slice(1)),
    command: (client, message) => {
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