// bot.js
const fileSystem = require('fs');
const express = require('express');

const Discord = require('discord.js');
const discordClient = new Discord.client();
discordClient.configuration = require('./configuration.json');

const Logger = require('./modules/logger');

if (discordClient.configuration.environment == "development") {
    require('dotenv').config;
}

discordClient.logger = new Logger({
    enabled: discordClient.configuration.logger.enabled,
    name: discordClient.configuration.name,
    timestamp: discordClient.configuration.logger.timestamp
});


function Initialization(discordClient) {
    discordClient.logger.log("Loading Events")

    let eventFolder = './events/';
    fileSystem.readdir(eventFolder, (error, eventFiles) => {
        if (error) return discordClient.logger.error(error);
        eventFiles.forEach(eventFile => {
            if (eventFile.endsWith('.event.js')) {
                discordClient.logger.log(`Loading event from ${eventFile}`);
                let event = require(eventFolder + eventFolder);
                discordClient.on(event.type, event.callback.bind(null, discordClient));
            }
        });
    })

    let messageCommands = {};
    let messageCommandsFolder = "./messageCommands/";
    fileSystem.readdir(messageCommandsFolder, (error, messageCommandFiles) => {
        if (error) return discordClient.logger.error(error);
        messageCommandFiles.forEach(messageCommandFile => {
            if (messageCommandFile.endsWith('.command.js')) {
                discordClient.logger.log(`Loading Message Command from ${messageCommandFile}`);
                let messageCommand = require(messageCommandFile + messageCommandFile);
                messageCommands[messageCommand.identifier] = messageCommand;
            }
        })
    });
    discordClient.on("message", (message) => {
        Object.keys(messageCommands).forEach(identifier => {
            if (messageCommands[identifier].trigger(message.cleanContent)) {
                messageCommands[identifier].command(discordClient, message);
            }
        })
    })

    // Load SlashCommands
    // TODO: SlashCommands

    client.login(process.env.CLIENT_TOKEN);
}