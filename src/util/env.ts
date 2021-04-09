import { appLogger } from './log';

export function getEnvVar(
    name: string,
    commonName: string,
    abort = true
): string | undefined {
    const val = process.env[name] || undefined;

    if (!val) {
        if (abort) {
            appLogger.error(
                `${commonName} not found. Please set the environment variable $${name}. Aborting.`
            );

            process.exit(1);
        } else {
            appLogger.warn(
                `${commonName} not found. Please set the environment variable $${name}.`
            );
        }

        return undefined;
    }

    return val;
}
