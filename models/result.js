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
}, { versionKey: false, _id : false });

const ClickSchema = new Schema({
    position: {
        type: PositionSchema,
        required: true
    },
    misclick: {
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
}, { versionKey: false, _id : false });

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
    cursorPositions: {
        type: [PositionSchema]
    },
    clicks: {
        type: [ClickSchema],
        required: true
    },
    misclickCount: {
        type: Number,
        required: true
    },
    timeNeeded: {
        type: Number,
        required: true
    },
    cursorPathLength: {
        type: Number,
    }
}, { versionKey: false });

const Result = model('Result', ResultSchema);
export default Result;