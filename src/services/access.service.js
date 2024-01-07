"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");

const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, ForbiddenError, AuthFailureError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const roleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {

  /*
     check this token used?
  */

  static handleRefreshToken = async(refreshToken) => {
    // check token này đã đc sd chưa
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
    // nếu có
    if(foundToken){
      // decode xem token là thằng nào
      const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey)
      console.log({ userId, email });
      // delete all token in keystore
      await KeyTokenService.deleteKeyById(userId)
      throw new ForbiddenError('Something wrong happend !! pls relogin')
    }
    // k có
    const houderToken = await KeyTokenService.findByRefreshToken(refreshToken)
    if(!houderToken) throw new AuthFailureError('Shop not registered')

    // verify token
    const { userId, email } = await verifyJWT(refreshToken, houderToken.privateKey)
    console.log('[2]--', { userId, email });
    // check userID
    const foundShop = await findByEmail({email})
    if(!foundShop) throw new AuthFailureError('Shop not registered')

    // create token news
    const tokens =  await createTokenPair({ userId, email }, houderToken.publicKey, houderToken.privateKey)
    // update token
    await houderToken.updateOne({
        $set: {
          refreshToken: tokens.refreshToken
        },
        $addToSet: {
          refreshTokensUsed: refreshToken
        }
    })

    return {
      user: { userId, email },
      tokens
    }
    
  }

  /*
    1 - check email in db
    2 - match pw
    3 - create Access token and refresh token and save
    4 - generate tokens
    5 - get data return login
  */
  static login = async({ email, password, refreshToken = null}) => {
    // 1
    const foundShop = await findByEmail({ email })
    if(!foundShop) throw new BadRequestError('Shop not registered')
    // 2
    const match = bcrypt.compare( password, foundShop.password)
    if(!match) throw new AuthFailureError('Authentication error')
    // 3
    const privateKey = crypto.randomBytes(64).toString('hex')
    const publicKey = crypto.randomBytes(64).toString('hex')
    // 4
    const { _id: userId } = foundShop
    const tokens = await createTokenPair({ userId, email }, publicKey, privateKey)

    await KeyTokenService.createKeyToken({
      userId,
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey
    })

    return {
      shop: getInfoData({fileds: ['_id', 'name', 'email'], object: foundShop}),
      tokens,
    };
  }

  static logout = async(keyStore) => {
      const delKey = await KeyTokenService.removeKeyById(keyStore._id)
      console.log( {delKey});
      return delKey
  }

  static signUp = async ({ name, email, password }) => {
      // step1: check email exist?
      const holderShop = await shopModel.findOne({ email }).lean();
      if (holderShop) {
        throw new BadRequestError('Error: shop already registered!')
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [roleShop.SHOP],
      });

      if (newShop) {
        // created privateKey, publicKey
        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')

        console.log({ privateKey, publicKey }); // save collection keystore

        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey
        });

        if (!keyStore) {
          throw new BadRequestError('Error: keyStore error')
        }

        // create token pair
        const tokens = await createTokenPair({userId: newShop._id, email}, publicKey, privateKey)
        console.log(`Created token success::`, tokens);

        return {
          code: 201,
          metadata: {
            shop: getInfoData({fileds: ['_id', 'name', 'email'], object: newShop}),
            tokens,
          },
        };
      }

      return {
        code: 200,
        medata: null,
      };
  };
}

module.exports = AccessService;
