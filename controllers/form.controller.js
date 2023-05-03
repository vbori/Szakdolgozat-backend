import { ObjectId } from 'mongodb'; 
import Form from '../models/Form.js';
import { getExperimentByIdAndResearcherId, updateExperiment } from '../services/experiment.service.js';
import { addForm, findForm, updateForm, deleteForm } from '../services/form.service.js';

export const createForm = async (req, res) => {
    try {
      const experiment = await getExperimentByIdAndResearcherId(req.body.experimentId, req.user._id);
      if(!experiment) {
        return res.status(401).send('Not Allowed');
      }else{
        const newForm = new Form({
          researcherId: ObjectId(req.user._id),
          experimentId: ObjectId(req.body.experimentId),
          questions: req.body.questions
        });
        const form = await addForm(newForm);
        await updateExperiment(req.body.experimentId, req.user._id, { $set: { formId: form._id } });
        console.log(`Form created with id: ${form._id}`);
        res.status(201).json({message: 'Form saved'});
      }
    } catch(err) {
      console.log(`Error in saving form: ${err}`);
      if(err.name === 'ValidationError' || err.name === 'TypeError') {
        return res.status(400).send('Invalid request');
      }
      res.status(500).send('Error in saving form');
    }
}

export const getForm = async (req, res) => {
    try{
      const form = await findForm(req.query.experimentId);
      if(!form || form.researcherId != req.user._id) {
        return res.status(401).send('Form not found');
      }else{
        const questions = form.questions;
        res.status(200).json({questions});
      }
    }catch(err){
      console.log(`Error in finding form: ${err}`);
      if(err.name === 'ValidationError' || err.name === 'TypeError') {
        return res.status(400).send('Invalid request');
      }
      res.status(500).send('Error in getting form');
    }
}

export const getFormForParticipant = async (req, res) => {
    try{
        const form = await findForm(req.params.experimentId);
        if(!form){
            res.status(401).send('Form not found');
        }else{
            const questions = form.questions;
            res.status(200).json({questions});
        }
    }catch(err){
        console.log(`Error in finding form: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).send('Invalid request');
        }
        res.status(500).send('Internal server error');
    }
}

export const editForm = async (req, res) => {
    try{
      const form = await updateForm(req.body.experimentId, req.user._id, {questions: req.body.questions});
      if(!form) {
        return res.status(401).send('Not Allowed');
      }else{
        res.status(200).json({message:'Form edited'});
      }
    }catch(err){
      console.log(`Error in editing form: ${err}`);
      if(err.name === 'ValidationError' || err.name === 'TypeError') {
        return res.status(400).send('Invalid request');
      }
      res.status(500).send('Error during editing form');
    }
}

export const removeForm = async (req, res) => {
    try{
      await deleteForm(req.query.experimentId, req.user._id);
      await updateExperiment(req.query.experimentId, req.user._id, { $set: { formId: null } });
      res.status(204).json({message:'Form deleted'});
    }catch(err){
      console.log(`Error in deleting form: ${err}`);
      if(err.name === 'ValidationError' || err.name === 'TypeError') {
        return res.status(400).send('Invalid request');
      }
      res.status(500).send('Error during deleting form');
    }
}

export const hasForm = async (req, res) => {
    try{
        const form = await findForm(req.params.experimentId);
        if(!form){
            res.status(200).json(false);
        }else{
            res.status(200).json(true);
        }
    }catch(err){
        console.log(`Error in searching form: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).send('Invalid request');
        }
        res.status(500).send('Error during searching form');
    }
}