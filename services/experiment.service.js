import Experiment from '../models/Experiment.js';
import { ObjectId } from 'mongodb';

export async function getExperimentById (experimentId) {
    const query = { _id: ObjectId(experimentId) };
    return Experiment.findOne(query).lean().exec();
}

export async function getExperimentsByResearcherId (researcherId) {
    const query = {researcherId: researcherId};
    return Experiment.find(query).lean().exec();
}

export async function getExperimentByIdAndResearcherId (experimentId, researcherId) {
    return Experiment.findOne({_id: ObjectId(experimentId), researcherId: ObjectId(researcherId)}).lean().exec();
}

export async function getExperimentsByResearcherIdAndStatus (researcherId, status) {
    const query = {researcherId: ObjectId(researcherId), status: status};
    const projection = { _id: 1, name: 1, researcherDescription: 1, status: 1, participantNum: 1 };
    return Experiment.find(query, projection).lean().exec();
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