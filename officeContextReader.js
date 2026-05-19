import officeParser from 'officeparser';

export async function officeContextReader(source) {
    const ast = await officeParser.parseOffice(source.trim(), {
        ignoreNotes: true,
        outputErrorToConsole: false
    });

    const result = await ast.to('text')
    return result.value
}
