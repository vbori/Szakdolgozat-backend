import { getExperimentById } from "../services/experiment.service.js";
import { findResultsByExperimentId, addResult } from '../services/result.service.js';
import { findParticipantsByExperimentId, findParticipantByIdAndExperimentId } from '../services/participant.service.js';
import { findForm } from '../services/form.service.js';
import Result from '../models/Result.js';

import fs from 'fs';
import archiver from 'archiver';
import path from 'path';
import { stringify } from 'csv-stringify';


export const downloadResults = async (req, res) => {
    try {
      const { experimentId, format } = req.params;
      let experiment = await getExperimentById(experimentId);
  
      if (!experiment) {
        return res.status(404).send('Experiment not found');
      }

      //parse experiment openedAt and closedAt to readable format
      experiment.openedAt = experiment.openedAt.toLocaleString();
      experiment.closedAt = experiment.closedAt.toLocaleString();

      const participants = await findParticipantsByExperimentId(experimentId);
      const results = await findResultsByExperimentId(experimentId);
      const form = await findForm(experiment._id);
  
      const archive = archiver('zip', { zlib: { level: 9 } });
  
      res.set('Content-Type', 'application/zip');
      res.set('Content-Disposition', `attachment; filename=${experimentId}.zip`);
  
      archive.pipe(res);
  
      switch(format){
        case 'json':
          archive.append(JSON.stringify(experiment), { name: 'experiment.json' });
          archive.append(JSON.stringify(participants), { name: 'participants.json' });
          archive.append(JSON.stringify(results), { name: 'results.json' });
          if(form != null){
            archive.append(JSON.stringify(form), {name: 'form.json'});
          }
          break;
        case 'csv':
          archive.append(stringify([experiment], { delimiter: '\t', header: true }), { name: 'experiment.csv' });
          archive.append(stringify(participants, { delimiter: '\t', header: true }), { name: 'participants.csv' });
          archive.append(stringify(results, { delimiter: '\t', header: true }), { name: 'results.csv' });
          if(experiment.formId){
            const form = await findForm(experiment._id);
            archive.append(stringify([form], { delimiter: '\t', header: true }), { name: 'form.csv' });
          }
          break;
        default:
          return res.status(400).send('Invalid format');
      }
  
      if(experiment.cursorImageMode){
        const experimentFolder = `./images/${experimentId}`;
        fs.readdir(experimentFolder, { withFileTypes: true }, (err, files) => {
          if (err) {
            console.error(err);
            archive.finalize();
            return res.status(500).send('Error');
          }
      
          // Loop through each participant folder and add the images to the zip file
          for (const file of files) {
            if (file.isDirectory()) {
              const participantFolder = path.join(experimentFolder, file.name);
              archive.directory(participantFolder, file.name);
            }
          }
      
          archive.finalize();
        });
      }else{
        archive.finalize();
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error');
    }
}

export const saveImage = async (req, res) => {
    const imageData = req.body.imageData;
    const base64Data = imageData.replace(/^data:image\/png;base64,/, ''); 
    const filePath = `./images/${req.body.experimentId}/${req.body.participantId}/round${req.body.roundIdx}.jpeg`; 

    fs.writeFile(filePath, base64Data, 'base64', (err) => {
      if (err) {
        console.error('Error saving image on server:', err);
        res.status(500).send('Failed to save image on server');
      } else {
        console.log('Image saved on server:', filePath);
        res.json({ message: 'Image saved on server'});
      }
    });
}

export const saveResult = async (req, res) => {
    try{
        const participant = await findParticipantByIdAndExperimentId(req.body.result.participantId, req.body.result.experimentId);
        if(!participant) return res.status(400).send('Cannot find participant');
        const newResult = new Result(req.body.result);
        await addResult(newResult);
        res.status(200).json({message:'Results added'});
    }catch(err){
        console.log(`Error in saving result: ${err}`);
        if(err.name === 'ValidationError' || err.name === 'TypeError') {
            return res.status(400).send('Invalid request');
        }
        res.status(500).send('Error during saving result');
    }
}