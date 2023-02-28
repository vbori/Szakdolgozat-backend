const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId; 

const ValidationSchema = new mongoose.Schema({
    min: {
        type: Number,
        required: true
    },
    max: {
        type: Number,
        required: true
    }
});

const QuestionSchema = new mongoose.Schema({
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
    options: {
        type: [String]
    },
    validation: {
        type: ValidationSchema
    },
    required: {
        type: Boolean,
        required: true
    }
});

const FormSchema = new mongoose.Schema({
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

const Form = mongoose.model('Form', FormSchema);
module.exports = Form;

module.exports.findFormByExperimentId = function(experimentId) {
    const query = {experimentId: experimentId};
    return Form.find(query).exec();
}

module.exports.deleteForm = async function(experimentId, callback) {
    try{
        const query = {experimentId: experimentId};
        await Form.remove(query);
        callback(null);
    } catch (err) {
        callback(err);
    }
}

module.exports.addForm = function(newForm, callback) {
    newForm.save(callback);
}

module.exports.editForm = async function(experimentId, questions, callback) {
    try {
        const form = await Form.findOne({experimentId: experimentId});
        if(!form) throw new Error('Form not found');
        form.questions = questions;
        form.save(callback);
    }  catch(err) {
        callback(err);
    } 
}