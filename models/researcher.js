require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const ResearcherSchema = new mongoose.Schema({
    username: { 
        type: String ,
        required: true
    },
    password: { 
        type: String ,
        required: true
    },
    experiments: { type: Array },
    liveExperimentCount: { type: Number }
});

const Researcher = mongoose.model('Researcher', ResearcherSchema);

module.exports =  Researcher;

module.exports.findResearcherByUsername = function(username) {
    const query = {username: username};
    return Researcher.findOne(query).exec();
}

module.exports.addResearcher = function(newResearcher, callback) {
    bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS), (err, salt) => {
        bcrypt.hash(newResearcher.password, salt, (err, hash) => {
            if (err) throw err;
            newResearcher.password = hash;
            newResearcher.save(callback);
        });
    });
}

module.exports.addExperiment = function(researcher, experiment, callback) {
    researcher.experiments.push(experiment);
    researcher.liveExperimentCount++;
    researcher.save(callback);
}

module.exports.changePassword = function(researcher, newPassword, callback) {
    bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS), (err, salt) => {
        bcrypt.hash(newPassword, salt, (err, hash) => {
            if (err) throw err;
            researcher.password = hash;
            researcher.save(callback);
        });
    });
}