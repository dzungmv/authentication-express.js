const app = require("./src/app");

const server = app.listen(3055, () => {
    console.log('App start with port 3055');  
})

process.on('SIGINT', () => {
    server.close(() => {console.log('\nApp has killed!')})
})