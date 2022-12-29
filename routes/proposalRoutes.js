const express = require('express')
const router = express.Router()
const proposalsController = require('../controllers/proposalsController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(proposalsController.getAllProposals)
    .post(proposalsController.createNewProposal)
    .patch(proposalsController.updateProposal)
    .delete(proposalsController.deleteProposal)

module.exports = router