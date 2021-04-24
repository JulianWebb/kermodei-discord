const axios = require('axios');
const Discord = require("discord.js");

module.exports = class {
    constructor(configuration) {
        this.configuration = {};
        this.configuration.enabled = configuration.enabled ?? true;
        this.configuration.name = configuration.name ?? "LOGGER";
        this.configuration.image = configuration.image ?? "";
        this.configuration.timestamp = configuration.timestamp ?? {
            enabled: true,
            iso8601: true
        };
        this.configuration.webhook = {
            enabled: configuration.webhook ?? false,
            id: process.env.WEBHOOK_ID,
            token: process.env.WEBHOOK_TOKEN
        }

        if (this.configuration.webhook.enabled) {
            if (!this.configuration.webhook.id || !this.configuration.webhook.token) {
                this.error("Missing Webhook Configuration");
            }
            this.webhookClient = new Discord.WebhookClient(this.configuration.webhook.id, this.configuration.webhook.token);
        }
    }

    get timestamp() {
        let now = new Date();
        let hour = now.getHours();
        let minute = now.getMinutes();
        let stringHour = hour > 9? hour: `0${hour}`;
        let stringMinute = minute > 9? minute: `0${minute}`;
        return `[${stringHour}:${stringMinute}]`;
    }

    get name() {
        return `[${this.configuration.name}]`;
    }

    webhookPrint(message) {
        if (this.configuration.webhook.enabled) {
            if (typeof message == "string") {
                return this.webhookClient.send(message);
            }
            if (Array.isArray(message)) {
                return this.webhookClient.send(message.reduce((accumulator, current) => accumulator + " " + current, ""), {
                    username: this.configuration.name,
                    avatarUrl: this.configuration.image,
                    split: true
                })
            }
        }
    }

    print(prefix, message) {
        if (this.configuration.enabled) {
            if (Array.isArray(message)) {
                message.unshift(prefix);
                console.log.apply(this, message);
                this.webhookPrint(message);
                return;
            }

            console.log.apply(this, [prefix, message]);
            this.webhookPrint([prefix, message]);
        }
    }

    get logPrefix() {
        return this.configuration.timestamp.enabled? `${this.timestamp}${this.name}`: this.name;
    }
    log(message) {
        if (this.configuration.enabled) {
            this.print(this.logPrefix, message);
        }
    }
    
    error(message) {
        if (this.configuration.enabled) {
            this.print(`${this.logPrefix}[ERROR]`, message);
        }
    }

    warn(message) {
        if (this.configuration.enabled) {
            this.print(`${this.logPrefix}[WARN]`, message);
        }
    }

    fatalError(message, exitCode) {
        this.error(message);
        process.exit(exitCode ?? 1);
    }
}