module.exports = class {
    constructor(configuration) {
        this.configuration = {};
        this.configuration.enabled = configuration.enabled ?? true;
        this.configuration.name = configuration.name ?? "LOGGER";
        this.configuration.timestamp = configuration.timestamp ?? {
            enabled: true,
            iso8601: true
        };
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

    print(prefix, message) {
        if (this.configuration.enabled) {
            if (Array.isArray(message)) {
                message.unshift(prefix);
                console.log.apply(this, message);
            }

            console.log.apply(this, [prefix, message]);
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
}