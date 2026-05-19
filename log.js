import chalk from 'chalk';

const log = {
    info: (msg) => console.log(chalk.yellowBright(msg)),
    message: (msg) => console.log(chalk.cyanBright(msg)),
    success: (msg) => console.log(chalk.greenBright(msg)),
    error: (msg) => console.error(chalk.redBright(msg))
};

export { log };
