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
        type: String,
        required: true
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
    }
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

const ShapeDistractionSchema = new Schema({
    distractingShapes: {
        type: [ShapeSchema],
        required: true
    },
    startTime: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true
    }
}, { versionKey: false, _id : false });

const RoundSchema = new Schema({
    roundIdx: {
        type: Number,
        required: true
    },
    isPractice: {
        type: Boolean
    },
    restTime: {
        type: Number
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
    }
}, { versionKey: false, _id : true });

const BackgroundDistractionConfigSchema = new Schema({
    backgroundDistractionColor: {
        type: String,
        required: true
    },
    minDistractionDurationTime: {
        type: Number,
        required: true
    },
    maxDistractionDurationTime: {
        type: Number,
        required: true
    },
    flashing: {
        type: FlashSchema
    }
}, { versionKey: false, _id : false });

const DistractingShapeConfigSchema = new Schema({
    distractingShapeMinWidth: {
        type: Number,
        required: true
    },
    distractingShapeMaxWidth: {
        type: Number,
        required: true
    },
    distractingShapeMinHeight: {
        type: Number,
        required: true
    },
    distractingShapeMaxHeight: {
        type: Number,
        required: true
    },
    distractingShapeTypes: {
        type: [String],
        required: true
    },
    distractingShapeColor: {
        type: String,
        required: true
    },
    minDistractionDurationTime: {
        type: Number,
        required: true
    },
    maxDistractionDurationTime: {
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
    twoDimensional: {
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
    baseShapeType: {
        type: [String],
        required: true
    },
    targetShapeType: {
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
        type: Schema.Types.ObjectId,
        required: true
    },
    formId: {
        type: Schema.Types.ObjectId
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
        type: Number
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
        type: String,
        required: false
    },
    positionTrackingFrequency: {
        type: Number,
        required: false
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

//TODO: refactor all models to MVC

const Experiment = model('Experiment', ExperimentSchema);
export default Experiment;

export async function getExperimentById (experimentId) {
    const query = { _id: ObjectId(experimentId) };
    return Experiment.findOne(query).lean().exec();
}

export async function getExperimentsByResearcherId (researcherId) {
    const query = {researcherId: researcherId};
    return Experiment.find(query).lean().exec();
}

export async function getExperimentsByResearcherIdAndStatus (researcherId, status) {
    const query = {researcherId: ObjectId(researcherId), status: status};
    return Experiment.find(query).lean().exec(); //TODO: project only necessary fields
}

export async function addExperiment (newExperiment) {
    return newExperiment.save();
}

export async function updateExperiment (experimentId, researcherId, updatedExperiment) {
    const query = { _id: ObjectId(experimentId), researcherId: ObjectId(researcherId) };
    return Experiment.findOneAndUpdate(query, updatedExperiment, { new: true }).lean().exec();
}

export async function increaseParticipantNum (experimentId) {
    const query = { _id: ObjectId(experimentId), status: 'Active', "$expr": { "$lt": [ "$participantNum" , "$maxParticipantNum" ]}};
    return Experiment.findOneAndUpdate(query, { $inc: { participantNum: 1 } }, { new: true }).lean().exec();
}

export async function deleteExperiment (experimentId) {
    return Experiment.findByIdAndDelete(experimentId).exec();
}