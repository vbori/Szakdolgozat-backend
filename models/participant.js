import { Schema, model } from 'mongoose';
import { ObjectId } from 'mongodb';

const ResponseSchema = new Schema({
    questionId: { type: String, required: true },
    response: { type: Schema.Types.Mixed, required: true }
}, { versionKey: false, _id : false });

const ParticipantSchema = new Schema({
    experimentId: { 
        type: ObjectId,
        required: true
    },
    globalId: { 
        type: String,
        required: true
    },
    responses: [ResponseSchema],

    inControlGroup: { 
        type: Boolean ,
        required: true
    }
}, { versionKey: false });

const Participant = model('Participant', ParticipantSchema);

export default  Participant;