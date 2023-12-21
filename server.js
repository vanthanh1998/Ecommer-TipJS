const app = require("./src/app");

const PORT = process.env.DEV_DB_PORT || 3056

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}` );
})

process.on('SIGINT', () => {
    server.close( () => console.log(`Exit Server Express`))
    // notify.send( ping...)
})