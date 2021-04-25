module.exports = {
    identifier: "listRoles",
    permission: "MANAGE_ROLES",
    syntax: "roles",
    description: "Lists roles on server and their respective IDs.",
    trigger: (testString) => /^roles.*/i.test(testString.slice(1)),
    command: (_, message) => {
        let rolesList = message.guild.roles.cache.reduce((accumulator, current) => {
            return accumulator + `${current.name}: ${current.id}\n`
        }, "")
        message.channel.send(rolesList);
    }
}