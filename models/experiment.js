import { Schema, model } from 'mongoose';
import { ObjectId } from 'mongodb';

const FlashSchema = new Schema({
    color: {
        type: String,
        required: true
    },
    frequency: {
        type: Number,
        required: true
    }
}, { versionKey: false, _id : false });

const ShapeSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    fill: {
        type: String,
        required: true
    },
    baseColor: {
        type: String
    },
    distraction: {
        type: Boolean,
        required: true
    },
    flashing: {
        type: FlashSchema
    },
    width: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
    radius: {
        type: Number
    },
    originX: {
        type: String,
        required: true
    },
    originY: {
        type: String,
        required: true
    },
    left: {
        type: Number,
        required: true
    },
    top: {
        type: Number,
        required: true
    },
    target: {
        type: Boolean,
        required: true
    },
    strokeWidth: {
        type: Number
    },
}, { versionKey: false, _id : false });

const BackgroundDistractionSchema = new Schema({
    color: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    flashing: {
        type: FlashSchema
    }
}, { versionKey: false, _id : false });

const RoundSchema = new Schema({
    roundIdx: {
        type: Number,
        required: true
    },
    canvasHeight: { 
        type: Number,
        required: true
    },
    canvasWidth: { 
        type: Number,
        required: true
    },
    background: {
        type: String,
        required: true
    },
    objects: {
        type: [ShapeSchema],
        required: true
    },
    backgroundDistraction: {
        type: BackgroundDistractionSchema
    },
    shapeDistractionDuration: {
        type: Number
    },
    breakTime: {
        type: Number
    }
}, { versionKey: false, _id : true });

const BackgroundDistractionConfigSchema = new Schema({
    color: {
        type: String,
        required: true
    },
    minDuration: {
        type: Number,
        required: true
    },
    maxDuration: {
        type: Number,
        required: true
    },
    flashing: {
        type: FlashSchema
    }
}, { versionKey: false, _id : false });

const DistractingShapeConfigSchema = new Schema({
    minWidth: {
        type: Number,
        required: true
    },
    maxWidth: {
        type: Number,
        required: true
    },
    minHeight: {
        type: Number,
        required: true
    },
    maxHeight: {
        type: Number,
        required: true
    },
    distractingShapeTypes: {
        type: [String],
        required: true
    },
    color: {
        type: String,
        required: true
    },
    minDuration: {
        type: Number,
        required: true
    },
    maxDuration: {
        type: Number,
        required: true
    },
    flashing: {
        type: FlashSchema
    }
}, { versionKey: false, _id : false });

const ConfigurationSchema = new Schema({
    setNum: {
        type: Number,
        required: true
    },
    roundNum: {
        type: Number,
        required: true
    },
    breakTime: {
        type: Number
    },
    backgroundColor: {
        type: String,
        required: true
    },
    baseShapeColor: {
        type: String,
        required: true
    },
    targetShapeColor: {
        type: String,
        required: true
    },
    distractedRoundNum: {
        type: Number,
        required: true
    },
    changePosition: {
        type: Boolean,
        required: true
    },
    changeShapeSize: {
        type: Boolean,
        required: true
    },
    oneDimensional: {
        type: Boolean,
        required: true
    },
    canvasHeight: {
        type: Number,
        required: true
    },
    canvasWidth: {
        type: Number,
        required: true
    },
    baseShapeTypes: {
        type: [String],
        required: true
    },
    targetShapeTypes: {
        type: [String],
        required: true
    },
    minWidth: {
        type: Number,
        required: true
    },
    maxWidth: {
        type: Number,
        required: true
    },
    minHeight: {
        type: Number,
        required: true
    },
    maxHeight: {
        type: Number,
        required: true
    },
    backgroundDistractionConfig: {
        type: BackgroundDistractionConfigSchema
    },
    distractingShapeConfig: {
        type: DistractingShapeConfigSchema
    }
}, { versionKey: false, _id : false });


const ExperimentSchema = new Schema({
    researcherId: {
        type: ObjectId,
        required: true
    },
    formId: {
        type: ObjectId
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    openedAt: {
        type: Date
    },
    closedAt: {
        type: Date
    },
    participantNum: {
        type: Number,
        required: true
    },
    maxParticipantNum: {
        type: Number,
        required: true
    },
    controlGroupChance: {
        type: Number,
        required: true
    },
    cursorImageMode: {
        type: String
    },
    positionTrackingFrequency: {
        type: Number
    },
    researcherDescription: {
        type: String,
        required: true
    },
    participantDescription: {
        type: String,
        required: true
    },
    rounds: {
        type: [RoundSchema],
        required: true
    },
    experimentConfiguration: {
        type: ConfigurationSchema
    }
}, { versionKey: false });

const Experiment = model('Experiment', ExperimentSchema);
export default Experiment;
