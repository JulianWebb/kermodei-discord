module.exports = class {
    constructor(parameters) {
        let validTypes = ["sqlite3"];
        this.type = parameters.type;
        if (!validTypes.includes(this.type)) throw(`Invalid or Missing 'Type', valid types: ${validTypes}`)
        switch(this.type) {
            case "sqlite3":
                this.database = new sqlite3(parameters.connection)
            break;
        }

    }

    set(table, key, value) {
        return this.database.set(table, key, value);
    }

    get(table, key) {
        return this.database.get(table, key);
    }

    delete(table, key) {
        return this.database.delete(table, key);
    }    
}

class sqlite3 {
    constructor(connection) {
        this.connection = connection;   
    }

    set(table, key, value) {
        if (!this.tableExists(table)) this.createTable(table);
        if (this.get(table, key)) return this.update(table, key, value);
        let statement = this.connection.prepare('INSERT INTO @table (key, value) VALUES (@key, @value);');
        return statement.run({ table, key, value })
    }

    get(table, key) {
        if (!this.tableExists(table)) return undefined;
        let statement = this.connection.prepare('SELECT value FROM @table WHERE key=@key;');
        return statement.get({ table, key });
    }

    update(table, key, value) {
        let statement = this.connection.prepare('UPDATE @table SET value=@value WHERE key=@key;');
        return statement.run({ table, key, value });
    }

    delete(table, key) {
        if (!this.tableExists(table)) return undefined;
        if (!this.get(table, key)) return undefined;
        let statement = this.connection.prepare('DELETE FROM @table WHERE key=@key;');
        return statement.run({ table, key })
    }

    tableExists(table) {
        let statement = this.connection.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=@table;`);
        return statement.get({ table })? true: false;
    }

    createTable(table) {
        let statement = this.connection.prepare('CREATE TABLE "@table" ( "key" TEXT NOT NULL UNIQUE, "value" TEXT NOT NULL, PRIMARY KEY("key"));');
        return statement.run({ table });
    }
}