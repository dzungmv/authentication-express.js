const JWT = require("jsonwebtoken")

async function createTokenPair({payload, publicKey, privateKey}) {
    try {
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: '2 days'
        })

        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: '7 days'
        })

        JWT.decode(accessToken, publicKey, (err, decode) => {
            if(err) {
                console.error('Error verify: ', err)
            } else {
                console.log("Verify success: ", decode);
                
            }
        })

        return {accessToken, refreshToken}
    } catch (error) {
        return error
    }
}

module.exports = { createTokenPair }