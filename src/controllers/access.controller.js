'use strict'

const AccessService = require("../services/access.service")

class AccessController {
    signUp = async (req, res, next) => {
        try {
            /*
                200: ok
                201: created
            */
            console.log(`[P]::SignUp::`, req.body)
            return res.status(200).json(await AccessService.signUp(req.body))
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new AccessController