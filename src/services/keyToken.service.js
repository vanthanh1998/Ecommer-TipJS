"use strict";

const { Types } = require("mongoose");
const keytokenModel = require("../models/keytoken.model");

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
    try {
      // level 0
      // const tokens = await keytokenModel.create({
      //   user: userId,
      //   publicKey,
      //   privateKey
      // });

      // return tokens ? tokens.publicKey : null;

      // level xx
      const filter = { user: userId }, update = {
        publicKey, privateKey, refreshTokensUsed: [], refreshToken
      }, options = { upsert: true, new: true }

      const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };

  static findByUserId = async(userId) => {
    return await keytokenModel.findOne({user: userId}).lean()
  }

  static removeKeyById = async ({ id }) => {
      const result = await keytokenModel.deleteOne({
          _id:  new Types.ObjectId(id)
      })
      return result;
  }
}

module.exports = KeyTokenService
