import { Schema, model } from 'mongoose';
import { ObjectId } from 'mongodb';

const ResponsesSchema = new Schema({
    questionId: { type: String, required: true },
    response: { type: Schema.Types.Mixed, required: true }
}, { versionKey: false, _id : false });

const ParticipantSchema = new Schema({
    experimentId: { 
        type: ObjectId,
        required: true
    },

    responses: [ResponsesSchema],

    inControlGroup: { 
        type: Boolean ,
        required: true
    }
}, { versionKey: false });

const Participant = model('Participant', ParticipantSchema);

export default  Participant;