const pino = require('pino');

const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:{
        target: 'pino-pretty',
        options: {
            translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
            ignore: "pid,hostname"
        }
    }
    
})

// export default logger
module.exports = logger;