import winston, { format, transports } from 'winston';
const { combine, timestamp, label, printf, colorize } = format;

const logFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

function createLogger(category: string) {
    winston.loggers.add(category, {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        format: combine(
            colorize(),
            label({ label: category }),
            timestamp(),
            logFormat
        ),
        transports: [new transports.Console()],
    });

    return winston.loggers.get(category);
}

export const appLogger = createLogger('APP');
export const botLogger = createLogger('BOT');
export const commandLogger = createLogger('COMMAND');
export const dataLogger = createLogger('DATA');
