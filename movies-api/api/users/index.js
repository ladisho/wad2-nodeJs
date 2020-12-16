import express from 'express';
import User from './userModel';
import jwt from 'jsonwebtoken';
import movieModel from "../movies/movieModel";
import { movies } from '../../seedData/movies';

const router = express.Router(); // eslint-disable-line

// Get all users
router.get('/', (req, res, next) => {
    User.find().then(
        users => res.status(200).json(users)
    ).catch(next);
});


router.get('/:userName/favourites', (req, res, next) => {
    const userName = req.params.userName;
    User.findByUserName(userName).populate('favourites').then(
        user => res.status(201).json(user.favourites)
    ).catch(next);
});


router.get('/:userName/genres', (req, res, next) => {
    const user = req.params.userName;
    User.find({ username: user }).then(
        user => res.status(201).send(user.genres)
    ).catch(next);
});


// Register/login a user
router.post('/', (req, res, next) => {
    if (!req.body.username || !req.body.password) {
        res.json({
            success: false,
            msg: 'Please pass username and password.',
        });
    };
    if (req.query.action === 'register') {
        User.create({
            username: req.body.username,
            password: req.body.password,
        }).then(user => res.status(201).json({
            code: 201,
            msg: 'Successful created new user.',
        })).catch(next);
    } else {
        User.findByUserName(req.body.username).then(user => {
            if (!user) return res.status(401).send({ code: 401, msg: 'Authentication failed. User not found.' });
            user.comparePassword(req.body.password, (err, isMatch) => {
                if (isMatch && !err) {
                    // if user is found and password is right create a token
                    const token = jwt.sign(user.username, process.env.secret);
                    // return the information including token as JSON
                    res.status(200).json({
                        success: true,
                        token: 'BEARER ' + token,
                    });
                } else {
                    res.status(401).send({
                        code: 401,
                        msg: 'Authentication failed. Wrong password.'
                    });
                }
            });
        }).catch(next);
    }
});


//Add a favourite. No Error Handling Yet. Can add duplicates too!
router.post('/:userName/favourites', async (req, res, next) => {
    const newFavourite = req.body.id;
    const userName = req.params.userName;
    const movie = await movieModel.findByMovieDBId(newFavourite).catch(next);
    const user = await User.findByUserName(userName).catch(next);
    if (!user.favourites.includes(movie._id)) {
        await user.favourites.push(movie._id).catch(next);
        await user.save();
        res.status(201).json(user);
    } else {
        res.status(403).json({"status":403,"message":"Favourite Already Exists"}); 
    }
    
})


router.post('/:userName/genres', (req, res, next) => {
    const newGenre = req.body;
    const query = { username: req.params.userName };
    if (newGenre && newGenre.id) {
        User.find(query).then(
            user => {
                (user.genres) ? user.genres.push(newGenre) : user.genres = [newGenre];
                console.log(user);
                User.findOneAndUpdate(query, { genres: user.genres }, {
                    new: true
                }).then(user => res.status(201).send(user));
            }
        ).catch(next);
    } else {
        res.status(401).send("Unable to find user")
    }
});


// Update a user
router.put('/:id', (req, res, next) => {
    if (req.body._id) delete req.body._id;
    User.update({
        _id: req.params.id,
    }, req.body, {
        upsert: false,
    })
        .then(user => res.json(200, user)).catch(next);
});
export default router;
