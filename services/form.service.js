import { ObjectId } from 'mongodb'; 
import Form from '../models/Form.js';

export async function findForm(experimentId) {
    const filter = {experimentId: ObjectId(experimentId)};
    return Form.findOne(filter).lean().exec();
}

export async function deleteForm(experimentId) {
    const filter = {experimentId: ObjectId(experimentId)};
    return Form.deleteOne(filter).exec();
}

export async function addForm(newForm) {
    return newForm.save();
}

export async function updateForm(experimentId, researcherId, editedForm) {
    const filter = { experimentId: ObjectId(experimentId), researcherId: ObjectId(researcherId) };
    return Form.findOneAndUpdate(filter, editedForm, { new: true }).lean().exec();
}