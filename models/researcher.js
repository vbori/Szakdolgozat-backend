import { Schema, model } from 'mongoose';

const ResearcherSchema = new Schema({
    username: { 
        type: String ,
        required: true
    },
    password: { 
        type: String ,
        required: true
    },
    activeExperimentCount: { 
        type: Number,
        required: true
    }
}, { versionKey: false });

const Researcher = model('Researcher', ResearcherSchema);

export default Researcher;