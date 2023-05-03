import Result from '../models/Result.js';
import { ObjectId } from 'mongodb';

export async function addResult(newResult) {
    return newResult.save();
}

export async function findResultsByExperimentId(experimentId) {
    return Result.find({experimentId: ObjectId(experimentId)}).sort({roundIdx:1, participantId:1}).lean().exec();
}

export async function findResultsByParticipantId(participantId) {
    return Result.find({participantId: ObjectId(participantId)}).sort({roundIdx:1}).exec();
}

export async function findResultsByRoundId(roundId) {
    return Result.find({roundId: ObjectId(roundId)}).sort({participantId:1}).exec();
}

export async function deleteResults(experimentId) {
    const query = {experimentId: ObjectId(experimentId)};
    return Result.deleteMany(query);
}