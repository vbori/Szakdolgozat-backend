import Token from '../models/Token.js';

export async function findToken(token) {
    return Token.findOne({token}).lean().exec();
}

export async function addToken(newToken) {
    return newToken.save().then(doc => doc.toObject());
}

export async function deleteToken(token) {
    return Token.deleteOne(token).exec();
}