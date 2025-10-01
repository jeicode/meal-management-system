export function logInfo(msg: string, ...args: unknown[]) {
    console.log('[INFO]', msg, ...args);
}

export function logError(msg: string, ...args: unknown[]) {
    console.error('[ERROR]', msg, ...args);
}