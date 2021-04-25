const axios = require('axios');
const Discord = require("discord.js");

class Logger {
    configuration:{
        enabled:boolean,
        name:string,
        timestamp:{
            enabled:boolean,
            iso8061:boolean
        },
        webhook:{
            enabled:boolean,
            id?:string|undefined,
            token?:string|undefined
        }
    };
    webhookClient:any;

    constructor(configuration:{ enabled?:boolean, name?:string, timestamp?:{ enabled?:boolean, iso8061?:boolean }, webhook?:{ enabled?: boolean, id?:string, token?:string}}) {  
        this.configuration = {
            enabled: configuration.enabled ?? true,
            name: configuration.name ?? "LOGGER",
            timestamp: configuration.timestamp? {
                enabled: configuration.timestamp.enabled ?? true,
                iso8061: configuration.timestamp.iso8061 ?? true,
            } : {
                enabled: true,
                iso8061: true
            },
            webhook: configuration.webhook? {
                enabled: configuration.webhook.enabled ?? false,
                id: configuration.webhook.id,
                token: configuration.webhook.token
            } : {
                enabled: false,
                id: undefined,
                token: undefined
            }
        };
        

        if (this.configuration.webhook.enabled) {
            if (!this.configuration.webhook.id || !this.configuration.webhook.token) {
                throw("Missing Webhook Configuration");

            }
            this.webhookClient = new Discord.WebhookClient(this.configuration.webhook.id, this.configuration.webhook.token);
        }
    }

    get timestamp():string {
        let now = new Date();
        let hour = now.getHours();
        let minute = now.getMinutes();
        let stringHour = hour > 9? hour: `0${hour}`;
        let stringMinute = minute > 9? minute: `0${minute}`;
        return `[${stringHour}:${stringMinute}]`;
    }

    get name():string {
        return `[${this.configuration.name}]`;
    }

    webhookPrint(message:string|string[]):void {
        if (this.configuration.webhook.enabled) {
            if (typeof message == "string") {
                return this.webhookClient.send(message);
            }
            if (Array.isArray(message)) {
                return this.webhookClient.send(message.reduce((accumulator, current) => accumulator + " " + current, ""), {
                    username: this.configuration.name,
                    split: true
                })
            }
        }
    }

    print(prefix:string, message:string|string[]):void {
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

    get logPrefix():string {
        return this.configuration.timestamp.enabled? `${this.timestamp}${this.name}`: this.name;
    }

    log(message:string|string[]):void {
        if (this.configuration.enabled) {
            this.print(this.logPrefix, message);
        }
    }
    
    error(message:string|string[]):void {
        if (this.configuration.enabled) {
            this.print(`${this.logPrefix}[ERROR]`, message);
        }
    }

    warn(message:string|string[]):void {
        if (this.configuration.enabled) {
            this.print(`${this.logPrefix}[WARN]`, message);
        }
    }

    fatalError(message:string|string[], exitCode:number):void {
        this.error(message);
        process.exit(exitCode ?? 1);
    }
}

module.exports = Logger;