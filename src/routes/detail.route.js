const express = require('express')
const controller = require('../controllers/detail.controller')
const router = express.Router()

router.get('/:pokemonName', controller.getDetail)

module.exports = router