import express from 'express';
import User from './userModel';

const router = express.Router(); // eslint-disable-line

// Get all users
router.get('/', (req, res, next) => {
    User.find().then(
        users => res.status(200).json(users)
    ).catch(next);
});

router.get('/:userName/favourites', (req, res, next) => {
    const user = req.params.userName;
    User.find({ username: user }).then(
        user => res.status(201).send(user.favourites)
    ).catch(next);
});

router.get('/:userName/genres', (req, res, next) => {
    const user = req.params.userName;
    User.find({ username: user }).then(
        user => res.status(201).send(user.genres)
    ).catch(next);
});


// authenticate a user
router.post('/', (req, res, next) => {
    if (!req.body.username || !req.body.password) {
        res.status(401).send('authentication failed');
    } else {
        User.findByUserName(req.body.username).then(user => {
            if (user.comparePassword(req.body.password)) {
                req.session.user = req.body.username;
                req.session.authenticated = true;
                res.status(200).json({
                    success: true,
                    token: "temporary-token"
                });
            } else {
                res.status(401).json('authentication failed');
            }
        }).catch(next);
    }

});

router.post('/:userName/favourites', (req, res, next) => {
    const newFavourite = req.body;
    const query = { username: req.params.userName };
    if (newFavourite && newFavourite.id) {
        User.find(query).then(
            user => {
                (user.favourites) ? user.favourites.push(newFavourite) : user.favourites = [newFavourite];
                console.log(user);
                User.findOneAndUpdate(query, { favourites: user.favourites }, {
                    new: true
                }).then(user => res.status(201).send(user));
            }
        ).catch(next);
    } else {
        res.status(401).send("Unable to find user")
    }
});

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
