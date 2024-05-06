import { exec } from '@actions/exec';

import { getTestCommand } from '../utils/getTestCommand';

export const runTest = async (
    testCommand: string,
    workingDirectory?: string,
    isVitest?: boolean
) => {
    await exec(
        await getTestCommand(
            testCommand,
            'report.json',
            workingDirectory,
            isVitest
        ),
        [],
        {
            cwd: workingDirectory,
        }
    );
};
