const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

const router = express.Router();

const { MONGO_URI } = process.env;

const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

router.post('/signin', async (req, res) => {
    const { password, email } = req.body;

    if (!password) {
        return res.status(400).json({ status: 400, message: 'missing password' });
    }

    if (!email) {
        return res.status(400).json({ status: 400, message: 'missing email' });
    }

    try {
        const client = new MongoClient(MONGO_URI, mongoOptions);
        await client.connect();
        const db = client.db('bycrpt');

        const authCollection = db.collection('auth');
        const accountsCollection = db.collection('accounts');

        const foundUser = await authCollection.findOne({ _id: email });

        if (!foundUser) {
            res.status(404).json({ status: 404, message: `no account exists with email: ${email}` });
            return client.close();
        }

        const matchingPassword = await bcrypt.compare(password, foundUser.password);

        if (!matchingPassword) {
            res.status(401).json({ status: 401, message: 'incorrect password' });
            return client.close();
        }

        const foundAccount = await accountsCollection.findOne({ _id: email });

        if (!foundAccount) {
            res.status(401).json({ status: 401, message: `no account exists with that email: ${email}` });
        } else {
            res.status(200).json({ status: 200, data: foundAccount });
        }

        return client.close();
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
});

router.post('/signup', async (req, res) => {
    const { email, password, name } = req.body;

    if (!password) {
        return res.status(400).json({ status: 400, message: 'missing password' });
    }

    if (!email) {
        return res.status(400).json({ status: 400, message: 'missing email' });
    }

    if (!name) {
        return res.status(400).json({ status: 400, message: 'missing name' });
    }

    try {
        const client = new MongoClient(MONGO_URI, mongoOptions);
        await client.connect();
        const db = client.db('bycrpt');

        const emailAlreadyInUse = await db.collection('auth').findOne({ _id: email });

        if (emailAlreadyInUse) {
            res.status(409).json({ status: 409, message: 'email already in use' });
            return client.close();
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.collection('auth').insertOne({ _id: email, email, password: hashedPassword });

        const newAccount = { _id: email, email, name, profile: { height: null, sex: null, weight: null }, workouts: [] };
        await db.collection('accounts').insertOne(newAccount);

        return res.status(201).json({ status: 201, message: 'Account creation successful!  Please see email for key' });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
});

module.exports = router;
