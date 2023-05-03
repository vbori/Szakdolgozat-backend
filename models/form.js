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
}, { versionKey: false, _id : false });

const Option = new Schema({
    optionLabel: {
        type: String,
        required: true
    }
}, { versionKey: false, _id : false });

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
}, { versionKey: false, _id : false });

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
}, { versionKey: false });

const Form = model('Form', FormSchema);
export default Form;