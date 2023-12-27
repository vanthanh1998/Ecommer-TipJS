"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");

const createTokenPair = require("../auth/authUtils");
const { getInfoData } = require("../utils");

const roleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      // step1: check email exist?
      const holderShop = await shopModel.findOne({ email }).lean();
      if (holderShop) {
        return {
          code: "xxx",
          message: "Shop already registered!",
        };
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
        const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
          modulusLength: 4096,
          publicKeyEncoding: {
            type: 'pkcs1', // pkcs8
            format: 'pem'
          },
          privateKeyEncoding: {
            type: 'pkcs1', // pkcs8
            format: 'pem'
          }
        });
        // Public key CrytoGraphy Standards

        console.log({ privateKey, publicKey }); // save collection keystore

        const publicKeyString = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
        });

        if (!publicKeyString) {
          return {
            code: "xxxx",
            message: "publicKeyString error",
          };
        }

        console.log(`publicKeyString::`, publicKeyString);
        const publicKeyObject = crypto.createPublicKey(publicKeyString)
        console.log(`publicKeyObject::`, publicKeyObject);

        // create token pair
        const tokens = await createTokenPair({userId: newShop._id, email}, publicKeyString, privateKey)
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
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };
}

module.exports = AccessService;
