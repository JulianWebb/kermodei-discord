// bot.js
const fileSystem = require('fs');
const express = require('express');

const Discord = require('discord.js');
const discordClient = new Discord.Client();
discordClient.configuration = require('../configuration.json');

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
        webhook: {
            enabled: discordClient.configuration.logger.webhook.enabled,
            id: process.env.WEBHOOK_ID,
            token: process.env.WEBHOOK_TOKEN
        }
    });
    discordClient.logger.log(`Starting ${discordClient.configuration.botName}`)

    discordClient.logger.log("Loading Events")
    let eventFolder = __dirname + '/events/';
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

    let PermissionsManager = require('./modules/permissions');
    discordClient.permissions = new PermissionsManager(discordClient.configuration.permissionTree, discordClient.configuration.roleList);
    let DatabaseManager = require('./modules/databaseManager');
    switch (discordClient.configuration.database.type) {
        case "sqlite3":
            try {
                let Database = require('better-sqlite3');
                let database = new Database(discordClient.configuration.database.options.file);
                discordClient.database = new DatabaseManager({
                    type: discordClient.configuration.database.type,
                    connection: database
                })
            } catch (error) {
                discordClient.logger.error(error);
                discordClient.logger.fatalError("Database type configuration set to: SQLite3, however module could not be loaded.");
            }
        break;
        default:
            discordClient.logger.fatalError("Missing Database Type Configuration");

    }

    discordClient.logger.log("Loading Message Commands")
    discordClient.messageCommands = {};
    let messageCommandFolder = __dirname +  "/messageCommands/";
    fileSystem.readdir(messageCommandFolder, (error, messageCommandFiles) => {
        if (error) return discordClient.logger.error(error);
        messageCommandFiles.forEach(messageCommandFile => {
            if (messageCommandFile.endsWith('.command.js')) {
                discordClient.logger.log(`Loading Message Command from ${messageCommandFile}`);
                let messageCommand = require(messageCommandFolder + messageCommandFile);
                discordClient.messageCommands[messageCommand.identifier] = messageCommand;
            }
        })
    });
    discordClient.on("message", (message) => {
        if (discordClient.configuration.channelWhitelist && !discordClient.configuration.channelWhitelist.includes(message.channel.id)) return;
        if (discordClient.configuration.channelBlacklist &&  discordClient.configuration.channelBlacklist.includes(message.channel.id)) return;
        if (message.author.id == discordClient.user.id) return;
        if (message.webhookID == process.env.WEBHOOK_ID) return;

        if (message.cleanContent.startsWith(discordClient.configuration.commandPrefix)) {
            Object.keys(discordClient.messageCommands).forEach(identifier => {
                let messageCommand = discordClient.messageCommands[identifier];
                if (messageCommand.channelWhitelist && !messageCommand.channelWhitelist.includes(message.channel.id)) return;
                if (messageCommand.channelBlacklist &&  messageCommand.channelBlacklist.includes(message.channel.id)) return;

                if (messageCommand.trigger(message.cleanContent)) {
                    let canUse = message.member.roles.cache.some(role => {
                        return discordClient.permissions.roleHasPermission(role.id, messageCommand.permission);
                    })
                    if (canUse) messageCommand.command(discordClient, message);
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