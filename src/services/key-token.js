const keyModel = require('./../models/key-token')

class KeyTokenService {
    static async createTokenKey({ userId, publicKey, privateKey }) {
        try {
            const tokens = await keyModel.create({
                user: userId,
                publicKey,
                privateKey
            })

            return tokens ? tokens.publicKey : null
        } catch (error) {
            return error
        }
    }
}

module.exports = KeyTokenService