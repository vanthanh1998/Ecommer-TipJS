'use strict'

const express = require('express')

const router = express.Router()

// check apiKey
router.use()
// check permission

router.use('/v1/api', require('./access'))

module.exports = router