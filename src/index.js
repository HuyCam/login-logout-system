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

const port = process.env.PORT || 3001;

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
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateToken();
        res.send({ user, token });
    } catch(e) {
        res.status(400).send(e)
    }
})

app.get('/users/me', auth, async(req, res) => {
    res.send({ user: req.user })
})

app.listen(port, () => {
    console.log('server is live');
})