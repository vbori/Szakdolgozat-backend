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
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newResearcher.password, salt, (err, hash) => {
            if (err) throw err;
            newResearcher.password = hash;
            newResearcher.save(callback);
        });
    });
}