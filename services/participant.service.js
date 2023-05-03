import Participant from '../models/Participant.js';
import { ObjectId } from 'mongodb'; 

export async function findParticipantsByExperimentId (experimentId) {
    const query = { experimentId: ObjectId(experimentId) };
    return Participant.find(query).lean().exec();
}

export async function findParticipantByIdAndExperimentId (participantId, experimentId) {
    return Participant.findOne({_id: ObjectId(participantId), experimentId: ObjectId(experimentId)}).lean().exec();
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