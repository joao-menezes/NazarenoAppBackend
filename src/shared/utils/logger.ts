import fs from "fs";
import winston, {createLogger, format} from 'winston';
import path from 'path';

const logsDir = path.join(__dirname, 'logs');

if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

function getLabel() {
    return path.basename(__filename);
}

const myFormat = format.printf(({ level, message, timestamp}) => {
    return `${timestamp} - ${level}: ${message})`;
});

const logger = createLogger({
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
        format.label({ label: getLabel() }),
        myFormat
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(logsDir, 'info.log'),
            level: 'info',
            format: format.combine(
                format((info) => (info.level === "info" ? info : false))(),
                myFormat
            ),
            handleExceptions: true,
            maxsize: 100000000
        }),
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            format: format.combine(
                format((info) => (info.level === "error" ? info : false))(),
                myFormat
            ),
            handleExceptions: true,
            maxsize: 100000000
        }),
        new winston.transports.Console({
            format: format.combine(
                format.colorize(),
                myFormat
            ),
            level: 'debug',
            handleExceptions: true,
        }),
    ],
});

export default logger;