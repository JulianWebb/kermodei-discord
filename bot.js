// bot.js
const fileSystem = require('fs');
const express = require('express');

const Discord = require('discord.js');
const discordClient = new Discord.Client();
discordClient.configuration = require('./configuration.json');

function Initialization(discordClient) {
    if (discordClient.configuration.environment == "development") {
        require('dotenv').config();
    }
    
    const Logger = require('./modules/logger');
    discordClient.logger = new Logger({
        enabled: discordClient.configuration.logger.enabled,
        name: discordClient.configuration.botName,
        image: discordClient.configuration.botImage,
        timestamp: discordClient.configuration.logger.timestamp,
        webhook: discordClient.configuration.logger.webhook
    });
    discordClient.logger.log(`Starting ${discordClient.configuration.botName}`)

    discordClient.logger.log("Loading Events")
    let eventFolder = './events/';
    fileSystem.readdir(eventFolder, (error, eventFiles) => {
        if (error) return discordClient.logger.error(error);
        eventFiles.forEach(eventFile => {
            if (eventFile.endsWith('.event.js')) {
                discordClient.logger.log(`Loading event from ${eventFile}`);
                let event = require(eventFolder + eventFile);
                discordClient.on(event.type, event.callback.bind(null, discordClient));
            }
        });
    })

    discordClient.logger.log("Loading Message Commands")
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
        if (message.cleanContent.startsWith(discordClient.configuration.commandPrefix)) {
            Object.keys(messageCommands).forEach(identifier => {
                if (messageCommands[identifier].trigger(message.cleanContent)) {
                    messageCommands[identifier].command(discordClient, message);
                }
            })
        }
        
    })

    discordClient.logger.log("Loading Slash Commands")
    // Load SlashCommands
    // TODO: SlashCommands

    discordClient.login(process.env.CLIENT_TOKEN);
}

Initialization(discordClient);