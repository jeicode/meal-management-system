export function logInfo(msg: string, ...args: any[]) {
    console.log('[INFO]', msg, ...args);
}

export function logError(msg: string, ...args: any[]) {
    console.error('[ERROR]', msg, ...args);
}