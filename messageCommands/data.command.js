module.exports = {
    identifier: "data",
    permission: "USE_COMMANDS",
    syntax: "data [set|get] [key] [value]",
    description: "Use to get or set a value from the database",
    trigger: (testString) => /^data\s(get|set)\s[\w\d]+\s*[\w\d]*/i.test(testString.slice(1)),
    command: (client, message) => {
        let parameters = /^data\s(?<action>get|set)\s(?<key>[\w\d]+)\s*(?<value>[\w\d]*)/gi.exec(message.cleanContent.slice(1));
        if (parameters.groups.action == "set") {
            if (!parameters.groups.value) {
                let result = client.database.delete("data", parameters.groups.key);
                if (result) message.channel.send(`Successfully removed ${parameters.groups.key} from table`);
                return void 0;
            }
            result = client.database.set("data", parameters.groups.key, parameters.groups.value);
            if (result) message.channel.send(`Successful set ${parameters.groups.key} to ${parameters.groups.value}`);
        } else {
            result = client.database.get("data", parameters.groups.key);
            if (result) {
                message.channel.send(`Key: ${parameters.groups.key}, Value: ${result.value}`);
            } else {
                message.channel.send(`No value found for key ${parameters.groups.key}`);
            }

        }
        return void 0;
    }
}