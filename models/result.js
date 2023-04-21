import { Schema, model } from 'mongoose';
import { ObjectId } from 'mongodb';

const PositionSchema = new Schema({
    x: {
        type: Number,
        required: true
    },
    y: {
        type: Number,
        required: true
    }
});

const ClickSchema = new Schema({
    position: {
        type: PositionSchema,
        required: true
    },
    missed: {
        type: Boolean,
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    distracted: {
        type: Boolean,
        required: true
    }
});

const ResultSchema = new Schema({
    experimentId: {
        type: ObjectId,
        required: true
    },
    participantId: {
        type: ObjectId,
        required: true
    },
    roundId: {
        type: ObjectId,
        required: true
    },
    roundIdx: {
        type: Number,
        required: true
    },
    cursorImagePath: {
        type: String
    },
    cursorPositions: {
        type: [PositionSchema]
    },
    clicks: {
        type: [ClickSchema],
        required: true
    },
    timeNeeded: {
        type: Number,
        required: true
    },
    cursorPathLength: {
        type: Number,
        required: true
    }
});

const Result = model('Result', ResultSchema);
export default Result;

export async function addResult(newResult) {
    return newResult.save();
}

export async function findResultsByExperimentId(experimentId) {
    return Result.find({experimentId: ObjectId(experimentId)}).sort({roundIdx:1, participantId:1}).exec();
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