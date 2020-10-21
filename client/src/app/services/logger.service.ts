import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  loggerResult = new EventEmitter();

  debug(message: string, style: string): string {
    const logEntry = this.createLogStatement(message.replace(/\r?\n|\r/gi, ''));
    console.log(logEntry, 'color: grey', style);
    return logEntry;
  }

  error(message: string, style: string): string {
    const logEntry = this.createLogStatement(message);
    console.error(logEntry, 'color: red', style);
    return logEntry;
  }

  warn(message: string, style: string): string {
    const logEntry = this.createLogStatement(message);
    console.warn(logEntry, 'color: orange', style);
    return logEntry;
  }

  info(message: string, style: string): string {
    const logEntry = this.createLogStatement(message);
    console.info(logEntry, 'color: grey', style);
    return logEntry;
  }

  createLogStatement(message: string): string {
    this.loggerResult.emit(`${this.getCurrentDate()} ${message}`);
    return `%c ${this.getCurrentDate()} %c ${message}`;
  }

  getCurrentDate(): string {
    const now = new Date();
    return `[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}]`;
  }
}
