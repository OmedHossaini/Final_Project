const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const router = express.Router();

const { MONGO_URI } = process.env;

const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

router.post('/update-profile', async (req, res) => {
    let client;

    const { email, height, sex, weight } = req.body;

    try {
        if (!email) {
            throw new Error('Missing email');
        }

        client = new MongoClient(MONGO_URI, mongoOptions);
        await client.connect();
        const db = client.db('bycrpt');
        const accountsCollection = db.collection('accounts');

        const existingUser = await accountsCollection.findOne({ _id: email });

        if (!existingUser) {
            console.error('User not found for email:', email);
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const updateQuery = {
            $set: {
                'profile.height': height || '',
                'profile.sex': sex || '',
                'profile.weight': weight || '',
            },
        };

        await accountsCollection.findOneAndUpdate(
            { _id: email },
            updateQuery
        );

        const updatedUserData = await accountsCollection.findOne({ _id: email });

        res.status(200).json({
            status: 200,
            message: 'Profile updated successfully',
            profile: {
                height: updatedUserData.profile?.height || '',
                sex: updatedUserData.profile?.sex || '',
                weight: updatedUserData.profile?.weight || '',
            },
        });
    } catch (err) {
        console.error('Error updating profile:', err.stack);
        res.status(500).json({ status: 500, message: 'Internal server error', error: err.message, stack: err.stack });
    } finally {
        if (client) {
            await client.close();
        }
    }
});

module.exports = router;
