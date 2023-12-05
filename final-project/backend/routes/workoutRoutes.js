const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const router = express.Router();

const { MONGO_URI } = process.env;

const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

router.post('/new-workout', async (req, res) => {
    const { email, date, details } = req.body;

    let client;

    try {
        client = new MongoClient(MONGO_URI, mongoOptions);
        await client.connect();
        const db = client.db('bycrpt');
        const accountsCollection = db.collection('accounts');

        const existingUser = await accountsCollection.findOne({ _id: email });

        if (!existingUser) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const newWorkout = { date, details };

        await accountsCollection.updateOne(
            { _id: email },
            { $push: { workouts: newWorkout } }
        );

        const updatedUserData = await accountsCollection.findOne({ _id: email });

        return res.status(201).json({
            status: 201,
            message: 'Workout added successfully',
            user: updatedUserData,
        });
    } catch (err) {
        console.error('Error adding workout:', err.stack);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: err.message,
            stack: err.stack,
        });
    } finally {
        if (client) {
            await client.close();
        }
    }
});

router.get('/workouts/:email', async (req, res) => {
    const { email } = req.params;

    let client;

    try {
        client = new MongoClient(MONGO_URI, mongoOptions);
        await client.connect();
        const db = client.db('bycrpt');
        const accountsCollection = db.collection('accounts');

        const user = await accountsCollection.findOne({ _id: email });

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const workouts = user.workouts || [];

        res.status(200).json({ status: 200, workouts });
    } catch (error) {
        console.error('Error fetching workouts:', error.message);
        res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
    } finally {
        if (client) {
            await client.close();
        }
    }
});

router.delete('/delete-workout/:email/:date/:details', async (req, res) => {
    const { email, date, details } = req.params;

    let client;

    try {
        client = new MongoClient(MONGO_URI, mongoOptions);
        await client.connect();
        const db = client.db('bycrpt');
        const accountsCollection = db.collection('accounts');

        const existingUser = await accountsCollection.findOne({ _id: email });

        if (!existingUser) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        console.log('Existing user before deletion:', existingUser);

        await accountsCollection.updateOne(
            { _id: email },
            { $pull: { workouts: { date, details } } }
        );

        const updatedUser = await accountsCollection.findOne({ _id: email });

        console.log('Updated user after deletion:', updatedUser);

        return res.status(200).json({
            status: 200,
            message: 'Workout deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting workout:', err.stack);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: err.message,
            stack: err.stack,
        });
    } finally {
        if (client) {
            await client.close();
        }
    }
});

router.put('/edit-workout/:email/:date/:details', async (req, res) => {
    const { email, date, details } = req.params;
    const { newDate, newDetails } = req.body;

    let client;

    try {
        client = new MongoClient(MONGO_URI, mongoOptions);
        await client.connect();
        const db = client.db('bycrpt');
        const accountsCollection = db.collection('accounts');

        const existingUser = await accountsCollection.findOne({ _id: email });

        if (!existingUser) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        console.log('Existing user before update:', existingUser);

        await accountsCollection.updateOne(
            { _id: email, 'workouts.date': date, 'workouts.details': details },
            { $set: { 'workouts.$.date': newDate, 'workouts.$.details': newDetails } }
        );

        const updatedUser = await accountsCollection.findOne({ _id: email });

        console.log('Updated user after update:', updatedUser);

        return res.status(200).json({
            status: 200,
            message: 'Workout updated successfully',
        });
    } catch (err) {
        console.error('Error updating workout:', err.stack);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: err.message,
            stack: err.stack,
        });
    } finally {
        if (client) {
            await client.close();
        }
    }
});

module.exports = router;
