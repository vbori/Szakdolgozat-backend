import { Schema, model } from 'mongoose';

const RefreshTokenSchema = new Schema({
  token: { type: String, required: true },
}, { versionKey: false });

const RefreshToken = model('RefreshToken', RefreshTokenSchema);

export default RefreshToken;

export async function findRefreshToken(token) {
    return RefreshToken.findOne({token}).lean().exec();
}

export async function addRefreshToken(newRefreshToken) {
    return newRefreshToken.save().then(doc => doc.toObject());
}

export async function deleteRefreshToken(token) {
    return RefreshToken.deleteOne(token).exec();
}