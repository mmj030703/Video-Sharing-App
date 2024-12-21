import mongoose from "mongoose";

export function doEmptyFieldExist(...values) {
    return values.some(value => !value || value.trim() === "");
}

export function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidMongoDBObjectId(id) {
    return mongoose.isValidObjectId(id);
}