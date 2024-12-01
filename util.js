const chalk = require('chalk');

const log = {
    info: (msg) => console.log(chalk.yellowBright(msg)),
    error: (msg) => console.error(chalk.redBright(msg)),
    success: (msg) => console.log(chalk.greenBright(msg)),
    message: (msg) => console.log(chalk.cyanBright(msg))
};

module.exports = { log };
