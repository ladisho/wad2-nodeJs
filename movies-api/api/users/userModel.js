import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const GenreSchema = new Schema({
    id: Number,
    name: String
});

const MovieSchema = new Schema({
    id: { type: Number, required: true },
    title: { type: String, required: true }
});

const UserSchema = new Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    favourites: [MovieSchema],
    genres: [GenreSchema]
});

export default mongoose.model('User', UserSchema);