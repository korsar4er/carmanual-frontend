

export function tokenIsExpired(string) {

    const buff = Buffer.from(string.split('.')[1], 'base64');
    const text = buff.toString('ascii')
    const expDate = new Date(JSON.parse(text)['exp'] * 1000)

    return expDate < new Date()
}

export function tokenExpireDate(string) {

    const buff = Buffer.from(string.split('.')[1], 'base64');
    const text = buff.toString('ascii')

    return new Date(JSON.parse(text)['exp'] * 1000)
}
