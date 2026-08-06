import pino, { LoggerOptions } from "pino";

const options: LoggerOptions = {
    level: process.env.LOG_LEVEL || "info",

    redact: {
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "req.body.password"
        ],
        remove: true
    }
};

if (process.env.NODE_ENV !== "production") {
    options.transport = {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname"
        }
    };
}

export const logger = pino(options);