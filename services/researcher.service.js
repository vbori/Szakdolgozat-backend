import pkg from 'bcryptjs';
import { ObjectId } from 'mongodb';
import Researcher from '../models/Researcher.js';
const { genSalt, hash: _hash } = pkg;

export async function findResearcherByUsername(username) {
    const filter = {username: username};
    return Researcher.findOne(filter).exec();
}

export async function findResearcherById(id) {
    return Researcher.findById(id).exec();
}

export async function addResearcher(newResearcher) {
    const salt = await genSalt(parseInt(process.env.SALT_ROUNDS));
    const hash = await hashPassword(newResearcher.password, salt);
    newResearcher.password = hash;
    return newResearcher.save();
}

export async function changeOpenExperimentCount(researcherId, change) {
    let filter;
    const MAX_ACTIVE_EXPERIMENTS = parseInt(process.env.MAX_ACTIVE_EXPERIMENTS);
    if(change == 1){
        filter=  { _id: ObjectId(researcherId), activeExperimentCount: { $lt: MAX_ACTIVE_EXPERIMENTS } };
    }else if(change== -1){
        filter=  { _id: ObjectId(researcherId), activeExperimentCount: { $gt: 0 } };
    }else{
        return null;
    }
    return Researcher.findOneAndUpdate(filter, {$inc: {activeExperimentCount: change}}, {new: true}).lean().exec();
}

export async function updatePassword(researcher, newPassword) {
    const salt = await genSalt(parseInt(process.env.SALT_ROUNDS));
    const hash = await hashPassword(newPassword, salt);
    researcher.password = hash;
    return researcher.save();
}

async function hashPassword(password, salt) {
    return new Promise((resolve, reject) => {
      _hash(password, salt, (err, hash) => {
        if (err) reject(err);
        else resolve(hash);
      });
    });
}