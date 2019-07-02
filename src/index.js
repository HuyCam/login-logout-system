const express = require('express');
const cors = require('cors');
require('./db/db');
const app = express();

// middlewares
const auth = require('./middlewares/auth');

// allow cross-origin
app.use(cors());

// parse json 
app.use(express.json());

// import model
const User = require('./models/user');

const port = process.env.PORT;

app.get('/', (req, res) => {
    res.send('Server is live');
})

app.post('/users/register', async (req, res) => {
    try {
        const user  = new User(req.body);
        const token = await user.generateToken();

        res.status(201).send({ user, token });
    } catch(e) {
        res.status(400).send();
    }
})

app.post('/users/login', async (req, res) => {
    try {
        // find and verify that user using his/her email and password and generate user token
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateToken();
        res.send({ user, token });
    } catch(e) {
        res.status(400).send(e)
    }
})

app.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(doc => doc.token !== req.token);
        await req.user.save();
        res.send({ msg: 'Log out successfully. '});
    } catch(e) {
        res.status(500).send();
    } 
})

// get user profile
app.get('/users/me', auth, async(req, res) => {
    res.send({ user: req.user })
})

// logout all tokens
app.post('/users/logout-all', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send({ msg: 'Log out all successfully'});
    } catch(e) {
        res.status(400).send();
    }
})

app.listen(port, () => {
    console.log('server is live');
})