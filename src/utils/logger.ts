import { transports, format, createLogger, Logger } from 'winston'
const { combine, timestamp, label, printf } = format

const logFormat = printf(({ level, message, timestamp, label }) => {
  return `[@effco/zoho-crm] ${level.toUpperCase()}: ${message}`
})

const logger: Logger = createLogger({
  transports: [
    new transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'error' : 'info'
    })
  ],
  format: format.combine(logFormat, format.colorize({ all: true }))
})

export default (
  moduleName: string,
  functionName: string,
  message: string,
  level: string = 'error'
): Logger => logger.log(level, `${moduleName}.${functionName}() - ${message}`)
