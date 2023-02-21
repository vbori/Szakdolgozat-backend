const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId; 

const responsesSchema = new mongoose.Schema({
    questionId: { type: String, required: true },
    response: { type: mongoose.Schema.Types.Mixed, required: true }
});

const ParticipantSchema = new mongoose.Schema({
    experimentId: { 
        type: String ,
        required: true
    },

    responses: [responsesSchema],

    inControlGroup: { 
        type: Boolean ,
        required: true
    }
});

const Participant = mongoose.model('Participant', ParticipantSchema);

module.exports =  Participant;

module.exports.findParticipantsByExperimentId = function(experimentId) {
    const query = {experimentId: experimentId};
    return Participant.find(query).exec();
}

module.exports.deleteParticipants = async function(experimentId, callback) {
    try{
        const query = {experimentId: experimentId};
        await Participant.remove(query);
        callback(null);
    } catch (err) {
        callback(err);
    }
}

module.exports.addParticipant = function(newParticipant, callback) {
    newParticipant.save(callback);
}

module.exports.addResponses = async function(participantId, responses, callback) {
    let participant;
    try {
        participant = await Participant.findOne(ObjectId(participantId));
        if(!participant) throw new Error('Participant not found');
        participant.responses.push(...responses);
        participant.save(callback);
    }  catch(err) {
        callback(err);
    }
    
}