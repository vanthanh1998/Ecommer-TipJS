"use strict";

const JWT = require("jsonwebtoken")
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const asyncHandler = require('../helpers/asyncHandler');

// service
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    console.log('tokens');
    // accessToken
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.log(`error verify::`, err);
      } else {
        console.log(`decode verify::`, decode);
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {}
};

const authentication = asyncHandler(async(req, res, next) => {
  /*
    1 - check userId missing???
    2 - get accessToken
    3 - verifyToken
    4 - check user in db
    5 - check keyStore with this userId?
    6 - ok all => return next()
  */
    // 1
    const userId = req.headers[HEADER.CLIENT_ID]
    if(!userId)  throw new AuthFailureError('Invalid request')

    // 2
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if(!accessToken)  throw new AuthFailureError('Invalid access token')

    // 3
    const keyStore = await findByUserId(userId)
    if(!keyStore) throw new NotFoundError('Not Found Keystore')

    try {
      const decodeUser = JWT.verify( accessToken, keyStore.publicKey)
      if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid UserId')
      req.keyStore = keyStore
      return next()
    } catch (error) {
      throw error
    }
})

module.exports = {
  createTokenPair,
  authentication
}
