import Researcher from '../models/Researcher.js';
import {
    findResearcherByUsername, 
    findResearcherById, 
    updatePassword,
    addResearcher
} from '../services/researcher.service.js';

import bcryptjs from 'bcryptjs';
const { compare } = bcryptjs;

export const changePassword = async (req, res) => {
    try{
      const researcher = await findResearcherById(req.user._id);
      if(!researcher) {
        return res.status(400).send('Cannot find user');
      }
      if(await compare(req.body.oldPassword, researcher.password)) {
        await updatePassword(researcher, req.body.newPassword);
        res.status(200).json({message:'Password changed'});
      } else {
        res.status(401).send('Incorrect password');
      }
    }catch(err){
      console.log(`Error in changing password: ${err}`);
      if(err.name === 'ValidationError' || err.name === 'TypeError') {
        return res.status(400).send('Invalid request');
      }
      res.status(500).send('Password not changed');
    }
}

export const registerResearcher = async (req, res) => {
    try {
        const researcher = await findResearcherByUsername(req.body.username);
        if (researcher) {
            return res.status(400).send('Username already exists');
        }
        
        const newResearcher = new Researcher({
            username: req.body.username,
            password: req.body.password,
            activeExperimentCount: 0
        });
        await addResearcher(newResearcher);
        res.status(200).json({message:'Researcher added'});
    } catch(err) {
        if(err.name === 'ValidationError') {
            return res.status(400).send('Invalid request');
        }
        console.log(`Error in adding researcher: ${err}`);
        res.status(500).send('Error during registration');
    }
}