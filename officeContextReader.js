import officeParser from 'officeparser';

export async function officeContextReader(source) {
    return await officeParser.parseOfficeAsync(source.trim(), {
        ignoreNotes: true,
        outputErrorToConsole: false
    });
}
