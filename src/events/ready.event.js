module.exports = {
    type: "ready",
    callback: (client) => {
        client.logger.log("Connected to Discord");
    }
}