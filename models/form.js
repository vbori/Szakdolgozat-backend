import { Schema, model } from 'mongoose';
import { ObjectId } from 'mongodb'; 

const ValidationSchema = new Schema({
    min: {
        type: Number,
        required: true
    },
    max: {
        type: Number,
        required: true
    }
});

const Option = new Schema({
    optionLabel: {
        type: String,
        required: true
    }
});

const QuestionSchema = new Schema({
    questionId: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    options: [Option],
    validation: ValidationSchema,
    required: {
        type: Boolean,
        required: true
    }
});

const FormSchema = new Schema({
    researcherId: {
        type: ObjectId,
        required: true
    },
    experimentId: {
        type: String,
        required: true
    },
    questions: [QuestionSchema]
});

const Form = model('Form', FormSchema);
export default Form;

export async function findForm(experimentId) {
    const filter = {experimentId: ObjectId(experimentId)};
    return Form.findOne(filter).lean().exec();
}

export async function deleteForm(experimentId, researcherId) {
    const filter = {experimentId: ObjectId(experimentId), researcherId: ObjectId(researcherId)};
    return Form.deleteOne(filter).exec();
}

export async function addForm(newForm) {
    return newForm.save();
}

export async function editForm(experimentId, researcherId, editedForm) {
    const filter = { experimentId: ObjectId(experimentId), researcherId: ObjectId(researcherId) };
    return Form.findOneAndUpdate(filter, editedForm, { new: true }).lean().exec();
}