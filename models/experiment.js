import { Schema, model } from 'mongoose';
import { ObjectId } from 'mongodb';

const ShapeSchema = new Schema({
    shapeType: {
        type: String,
        required: true
    },
    isFilled: {
        type: Boolean,
        required: true
    },
    shapeColor: {
        type: String,
        required: true
    },
    flashColor: {
        type: String
    },
    flashFrequency: {
        type: Number
    },
    shapeWidth: {
        type: Number,
        required: true
    },
    shapeHeight: {
        type: Number,
        required: true
    },
    shapeX: {
        type: Number,
        required: true
    },
    shapeY: {
        type: Number,
        required: true
    },
    isTarget: {
        type: Boolean,
        required: true
    }
});

const BackGroundDistractionSchema = new Schema({
    backGroundDistractionColor: {
        type: String,
        required: true
    },
    startTime: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    flashFrequency: {
        type: Number
    },
    flashColor: {
        type: String
    }
});

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
});

const RoundSchema = new Schema({
    roundIdx: {
        type: Number,
        required: true
    },
    isPractice: {
        type: Boolean,
        required: true
    },
    restTime: {
        type: Number,
        required: true
    },
    shapes: {
        type: [ShapeSchema],
        required: true
    },
    backGroundDistraction: {
        type: BackGroundDistractionSchema
    },
    shapeDistractions: {
        type: [ShapeDistractionSchema]
    }
});

const BackGroundDistractionConfigSchema = new Schema({
    backGroundDistractionColor: {
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
    }
});

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
    distractingShapeColors: {
        type: [String],
        required: true
    },
    minDistractionDurationTime: {
        type: Number,
        required: true
    },
    maxDistractionDurationTime: {
        type: Number,
        required: true
    }
});

const ConfigurationSchema = new Schema({
    setNum: {
        type: Number,
        required: true
    },
    roundNum: {
        type: Number,
        required: true
    },
    practiceRoundNum: {
        type: Number,
        required: true
    },
    restTime: {
        type: Number,
        required: true
    },
    backgroundColors: {
        type: [String],
        required: true
    },
    shapeColors: {
        type: [String],
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
    minDistance: {
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
    backGroundDistractionConfig: {
        type: BackGroundDistractionConfigSchema
    },
    distractingShapeConfig: {
        type: DistractingShapeConfigSchema
    }
});


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
    type: {
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
    deadline: {
        type: Date
    },
    participantNum: {
        type: Number
    },
    maxParticipantNum: {
        type: Number,
        required: true
    },
    controlGroupSize: {
        type: Number,
        required: true
    },
    trajectoryImageNeeded: {
        type: Boolean,
        required: true
    },
    positionArrayNeeded: {
        type: Boolean,
        required: true
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
});

const Experiment = model('Experiment', ExperimentSchema);
export default Experiment;

export async function getExperimentById (experimentId, researcherId) {
    const query = { _id: ObjectId(experimentId), researcherId: ObjectId(researcherId) };
    return Experiment.findOne(query).lean().exec();
}

export async function getExperimentsByResearcherId (researcherId) {
    const query = {researcherId: researcherId};
    return Experiment.find(query).lean().exec();
}

export async function getExperimentsByResearcherIdAndStatus (researcherId, status) {
    const query = {researcherId: ObjectId(researcherId), status: status};
    return Experiment.find(query).lean().exec();
}

export async function addExperiment (newExperiment) {
    return newExperiment.save();
}

export async function updateExperiment (experimentId, researcherId, updatedExperiment) {
    const filter = { _id: ObjectId(experimentId), researcherId: ObjectId(researcherId) };
    return Experiment.findOneAndUpdate(filter, updatedExperiment, { new: true }).lean().exec();
}

export async function deleteExperiment (experimentId) {
    return Experiment.findByIdAndDelete(experimentId).exec();
}