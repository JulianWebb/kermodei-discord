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
        return this.connection.prepare(`INSERT INTO "${table}" VALUES ('${key}', '${value}');`).run();
    }

    get(table, key) {
        if (!this.tableExists(table)) return undefined;
        return this.connection.prepare(`SELECT value FROM "${table}" WHERE key='${key}';`).get();
    }

    update(table, key, value) {
        return this.connection.prepare(`UPDATE "${table}" SET value='${value}' WHERE key='${key}';`).run();
    }

    delete(table, key) {
        if (!this.tableExists(table)) return undefined;
        if (!this.get(table, key)) return undefined;
        return this.connection.prepare(`DELETE FROM "${table}" WHERE key='${key}';`).run();
    }

    tableExists(table) {
        return this.connection.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='${table}';`).get()? true: false;
    }

    createTable(table) {
        return this.connection.prepare(`CREATE TABLE "${table}" ( "key" TEXT NOT NULL UNIQUE, "value" TEXT NOT NULL, PRIMARY KEY("key"));`).run();
    }
}