import { Schema, model } from 'mongoose';
import { ObjectId } from 'mongodb';

const ResponsesSchema = new Schema({
    questionId: { type: String, required: true },
    response: { type: Schema.Types.Mixed, required: true }
});

const ParticipantSchema = new Schema({
    experimentId: { 
        type: ObjectId,
        required: true
    },

    responses: [ResponsesSchema],

    inControlGroup: { 
        type: Boolean ,
        required: true
    }
});

const Participant = model('Participant', ParticipantSchema);

export default  Participant;

export async function findParticipantsByExperimentId (experimentId) {
    const query = { experimentId: ObjectId(experimentId) };
    return Participant.find(query).exec();
}
  
export async function deleteParticipants (experimentId) {
    const query = { experimentId: ObjectId(experimentId) };
    return Participant.deleteMany(query).exec();
}
  
export async function addParticipant (newParticipant) {
    return newParticipant.save();
}
  
export async function addResponses (participantId, responses) {
    try {
        const participant = await Participant.findOne(ObjectId(participantId));
        if (!participant) return null;
        participant.responses.push(...responses);
        return participant.save();
    } catch (err) {
        throw err;
    }
}