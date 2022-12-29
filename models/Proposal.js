const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const proposalSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        title: {  /*product_name */
            type: String,
            required: true
        },
        text: {     /*requirements */
            type: String,
            required: true
        },
        items:{
         type: String,
         required: true
        },
        cost:{
            type: Number,
            required: true
        },
        startDate:{
            type: Date,
            
        },
        remark:{
            type: String,
           },
        completed: {
            type: Boolean,
            default: false
        },
        proposedTo:{
            type: String,
            required: true
           },
        proposedBy:{
            type: String,
            required: true
           },
    },
    {
        timestamps: true
    }
)

proposalSchema.plugin(AutoIncrement, {
    inc_field: 'ticket',
    id: 'ticketNums',
    start_seq: 1
})

module.exports = mongoose.model('Proposal', proposalSchema)