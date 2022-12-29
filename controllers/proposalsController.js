const Proposal = require('../models/Proposal')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')

// @desc Get all proposals 
// @route GET /proposals
// @access Private
const getAllProposals = asyncHandler(async (req, res) => {
    // Get all proposals from MongoDB
    const proposals = await Proposal.find().lean()

    // If no notes 
    if (!proposals?.length) {
        return res.status(400).json({ message: 'No proposals found' })
    }

    // Add username to each note before sending the response 
    // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE 
    // You could also do this with a for...of loop
    const proposalsWithUser = await Promise.all(proposals.map(async (proposal) => {
        const user = await User.findById(proposal.user).lean().exec()
        return { ...proposal, username: user.username }
    }))

    res.json(proposalsWithUser)
})

// @desc Create new proposal
// @route POST /proposals
// @access Private
const createNewProposal = asyncHandler(async (req, res) => {
    const { user, title, text,items ,cost , startDate,remark,proposedTo,proposedBy } = req.body

    // Confirm data
    if (!user || !title || !text || !items|| !cost|| !proposedTo || !proposedBy) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate title
    const duplicate = await Proposal.findOne({ title }).collation({locale:'en',strength:2}).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate proposal title' })
    }

    // Create and store the new user 
    const proposal = await Proposal.create({ user, title, text, items, cost, startDate,remark,proposedBy,proposedTo })

    if (proposal) { // Created 
        return res.status(201).json({ message: 'New proposal created' })
    } else {
        return res.status(400).json({ message: 'Invalid proposal data received' })
    }

})

// @desc Update a proposal
// @route PATCH /proposals
// @access Private
const updateProposal = asyncHandler(async (req, res) => {
    const { id, user, title, text, items, cost, startDate, remark, completed,proposedBy,proposedTo } = req.body

    // Confirm data
    if (!id || !user || !title || !text || !items|| !cost || !proposedBy || !proposedTo || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Confirm note exists to update
    const proposal = await Proposal.findById(id).exec()

    if (!proposal) {
        return res.status(400).json({ message: 'Proposal not found' })
    }

    // Check for duplicate title
    const duplicate = await Proposal.findOne({ title }).collation({locale:'en',strength:2}).lean().exec()

    // Allow renaming of the original note 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate proposal title' })
    }

    proposal.user = user
    proposal.title = title
    proposal.text = text
    proposal.items = items
    proposal.cost = cost
    proposal.startDate = startDate
    proposal.remark = remark
    proposal.completed = completed
    proposal.proposedBy = proposedBy
    proposal.proposedTo = proposedTo

    const updatedProposal = await proposal.save()

    res.json(`'${updatedProposal.title}' updated`)
})

// @desc Delete a proposal
// @route DELETE /proposals
// @access Private
const deleteProposal = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Proposal ID required' })
    }

    // Confirm note exists to delete 
    const proposal = await Proposal.findById(id).exec()

    if (!proposal) {
        return res.status(400).json({ message: 'Proposal not found' })
    }

    const result = await proposal.deleteOne()

    const reply = `Proposal '${result.title}' with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllProposals,
    createNewProposal,
    updateProposal,
    deleteProposal
}