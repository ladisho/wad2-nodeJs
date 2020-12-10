import session from 'express-session';
import passport from './authenticate';
import dotenv from 'dotenv';
import express from 'express';
import moviesRouter from './api/movies';
import bodyParser from 'body-parser';
import './db';
import { loadUsers, loadMovies } from './seedData';
import usersRouter from './api/users';
import genresRouter from './api/genres';


dotenv.config();

const errHandler = (err, req, res, next) => {
    /* if the error in development then send stack trace to display whole error,
    if it's in production then just send error message  */
    if (process.env.NODE_ENV === 'production') {
        return res.status(500).send(`Something went wrong!`);
    }
    res.status(500).send(`Hey!! You caught the error 👍👍, ${err.stack} `);
};

const app = express();

const port = process.env.PORT;

if (process.env.SEED_DB) {
    loadUsers();
    loadMovies();
}


app.use(bodyParser.json());
app.use(bodyParser.urlencoded());


//session middleware
app.use(session({
    secret: 'ilikecake',
    resave: true,
    saveUninitialized: true
}));


// initialise passport​
app.use(passport.initialize())

// app.use(express.static('public'));
// Add passport.authenticate(..)  to middleware stack for protected routes​
app.use('/api/movies', passport.authenticate('jwt', { session: false }), moviesRouter);


//Users router
app.use('/api/users', usersRouter);

app.use('/api/genres', genresRouter);

app.use(errHandler);

app.listen(port, () => {
    console.info(`Server running at ${port}`);
});