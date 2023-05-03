import { Schema, model } from 'mongoose';

const TokenSchema = new Schema({
  token: { type: String, required: true },
}, { versionKey: false });

const Token = model('Token', TokenSchema);

export default Token;