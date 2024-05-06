import { exec } from '@actions/exec';
import semver from 'semver';

import { isOldScript } from './isOldScript';

const checkPnpmVersion = async () => {
    try {
        let versionStr = '';
        await exec('pnpm -v', undefined, {
            listeners: {
                stdout: (data) => {
                    versionStr += data.toString();
                },
            },
        });

        return semver.satisfies(versionStr.trim(), '< 7.0.0');
    } catch (error) {
        return true;
    }
};

export const getTestCommand = async (
    command: string,
    outputFile: string,
    workingDirectory: string | undefined,
    isVitest: boolean | undefined
) => {
    if (await isOldScript(command, workingDirectory)) {
        // TODO: add warning here
        return command;
    }

    const isNpmStyle =
        command.startsWith('npm') ||
        (command.startsWith('pnpm') && (await checkPnpmVersion()));

    const hasDoubleHyphen = command.includes(' -- ');

    // building new command
    const newCommandBuilder: (string | boolean)[] = [
        command,
        // add two hypens if it is npm or pnpm package managers and two hyphens don't already exist
        isNpmStyle && !hasDoubleHyphen && '--',
        // argument which indicates that jest runs in CI environment
        !isVitest && '--ci',
        // telling jest that output should be in json format
        !isVitest && '--json',
        // force jest to collect coverage
        !isVitest && '--coverage',
        // argument which tells jest to include tests' locations in the generated json output
        !isVitest && '--testLocationInResults',
        // output file
        `--outputFile="${outputFile}"`,
    ];

    return newCommandBuilder.filter(Boolean).join(' ');
};
