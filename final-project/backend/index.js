const bcrypt = require('bcrypt');
const express = require("express");
const morgan = require("morgan");
const cors = require('cors');
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const fetch = require('node-fetch');
const PORT = 9365;


const { MONGO_URI, ZENQUOTES_API_URL } = process.env;

const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};


const server = express();

server.use(morgan("tiny"));
server.use(cors());
server.use(express.json());



server.get("/api/test", (req, res) => {
    res
    .status(200)
    .json({ status: 200, message: "Good job!" });
});

server.post("/api/signin", async (req, res) => {
    const { password, email } = req.body;

    if (!password) {
        return res.status(400).json({ status: 400, message: "missing password" });
    }

    if (!email) {
        return res.status(400).json({ status: 400, message: "missing email" });
    }

    try {
        const client = new MongoClient(MONGO_URI, mongoOptions);
        await client.connect();
        const db = client.db("bycrpt");

        const authCollection = db.collection("auth");
        const accountsCollection = db.collection("accounts");

        const foundUser = await authCollection.findOne({ _id: email });

        if (!foundUser) {
            res.status(404).json({ status: 404, message: `no account exists with email: ${email}` });
            return client.close();
        }

        const matchingPassword = await bcrypt.compare(password, foundUser.password);

        if (!matchingPassword) {
            res.status(401).json({ status: 401, message: `incorrect password` });
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

server.post("/api/signup", async (req, res) => {
    const { email, password, name } = req.body;

    if (!password) {
        return res.status(400).json({ status: 400, message: "missing password" });
    }

    if (!email) {
        return res.status(400).json({ status: 400, message: "missing email" });
    }

    if (!name) {
        return res.status(400).json({ status: 400, message: "missing name" });
    }

    try {
        const client = new MongoClient(MONGO_URI, mongoOptions);
        await client.connect();
        const db = client.db("bycrpt");

        const emailAlreadyInUse = await db.collection("auth").findOne({ _id: email });

        if (emailAlreadyInUse) {
            res.status(409).json({ status: 409, message: "email already in use" });
            return client.close();
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        await db.collection("auth").insertOne({ _id: email, email, password: hashedPassword });

        

        const newAccount = { _id: email, email, name, profile: {height:null, sex:null, weight:null}, workouts:[]};
        await db.collection("accounts").insertOne(newAccount);
        return res.status(201)
        .json({ status: 201, message: "Account creation successful!  Please see email for key", 
        });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
});
server.get('/api/inspiration', async (req, res) => {
    try {
    const response = await fetch(ZENQUOTES_API_URL);
    const data = await response.json();
    if (response.ok) {
        res.status(200).json({ inspiration: data[0].q });
    } else {
        res.status(response.status).json({ error: 'Failed to fetch inspiration' });
    }
    } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    }
});

server.post('/api/update-profile', async (req, res) => {
    let client;

    const { email, height, sex, weight } = req.body;
    console.log('Received update profile request for email:', email);

    try {
        if (!email) {
            throw new Error('Missing email');
        }

        client = new MongoClient(MONGO_URI, mongoOptions);
        await client.connect();
        const db = client.db('bycrpt');
        const accountsCollection = db.collection('accounts');
        console.log('Searching for user with email:', email);

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

        console.log('Updated User Data:', updatedUserData);

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
server.post('/api/new-workout', async (req, res) => {
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
server.get('/api/workouts/:email', async (req, res) => {
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


server.delete('/api/delete-workout/:email/:date/:details', async (req, res) => {
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
server.put('/api/edit-workout/:email/:date/:details', async (req, res) => {
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
server.post('/api/add-weight/:email', async (req, res) => {
  const { email } = req.params;
  const { weight } = req.body;

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

    const newWeightEntry = { date: new Date().toISOString(), weight: parseFloat(weight) };

    await accountsCollection.updateOne(
      { _id: email },
      { $push: { weights: newWeightEntry } }
    );

    const updatedUserData = await accountsCollection.findOne({ _id: email });

    return res.status(201).json({
      status: 201,
      message: 'Weight added successfully',
      user: updatedUserData,
    });
  } catch (err) {
    console.error('Error adding weight:', err.stack);
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

server.get('/api/weights/:email', async (req, res) => {
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

    const weights = user.weights || [];

    res.status(200).json({ status: 200, weights });
  } catch (error) {
    console.error('Error fetching weights:', error.message);
    res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
});
server.delete('/api/remove-weight/:email', async (req, res) => {
    const { email } = req.params;
    const { date } = req.body;
  
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
  
      await accountsCollection.updateOne(
        { _id: email },
        { $pull: { weights: { date } } }
      );
  
      const updatedUserData = await accountsCollection.findOne({ _id: email });
  
      return res.status(200).json({
        status: 200,
        message: 'Weight removed successfully',
        user: updatedUserData,
      });
    } catch (err) {
      console.error('Error removing weight:', err.message);
      return res.status(500).json({
        status: 500,
        message: 'Internal server error',
        error: err.message,
      });
    } finally {
      if (client) {
        await client.close();
      }
    }
  });

server.put('/api/update-height/:email', async (req, res) => {
    const { email } = req.params;
    const { height } = req.body;
  
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
  
      await accountsCollection.updateOne(
        { _id: email },
        { $set: { 'profile.height': parseFloat(height) } }
      );
  
      const updatedUserData = await accountsCollection.findOne({ _id: email });
  
      return res.status(200).json({
        status: 200,
        message: 'Height updated successfully',
        user: updatedUserData,
      });
    } catch (err) {
      console.error('Error updating height:', err.message);
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

server.get('/api/user/:email', async (req, res) => {
  const { email } = req.params;
  let client = null;

  try {
    client = new MongoClient(MONGO_URI, mongoOptions);
    await client.connect();
    const db = client.db('bycrpt');
    const accountsCollection = db.collection('accounts');

    const user = await accountsCollection.findOne({ _id: email });

    if (!user) {
      return res.status(404).json({ status: 404, message: 'User not found' });
    }

    res.status(200).json({ status: 200, user });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
});
server.put('/api/update-height/:email', async (req, res) => {
  const { email } = req.params;
  const { height } = req.body;

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

    await accountsCollection.updateOne(
      { _id: email },
      { $set: { 'profile.height': height } }
    );

    const updatedUserData = await accountsCollection.findOne({ _id: email });

    return res.status(200).json({
      status: 200,
      message: 'Height updated successfully',
      user: updatedUserData,
    });
  } catch (err) {
    console.error('Error updating height:', err.message);
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
server.post('/api/add-goal/:email', async (req, res) => {
  const { email } = req.params;
  const { goalType, goal } = req.body;

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

    const newGoal = {
      type: goalType,
      goal: goal,
    };

    await accountsCollection.updateOne(
      { _id: email },
      { $push: { 'profile.goals': newGoal } }
    );

    const updatedUserData = await accountsCollection.findOne({ _id: email });

    return res.status(201).json({
      status: 201,
      message: 'Goal added successfully',
      user: updatedUserData,
    });
  } catch (err) {
    console.error('Error adding goal:', err.stack);
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
server.delete('/api/delete-goal/:email', async (req, res) => {
  const { email } = req.params;
  const { goalType, goal } = req.query;

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

    const updateQuery = {
      $pull: {
        'profile.goals': {
          type: goalType,
          goal: goal,
        },
      },
    };

    await accountsCollection.updateOne({ _id: email }, updateQuery);

    const updatedUser = await accountsCollection.findOne({ _id: email });

    return res.status(200).json({
      status: 200,
      message: 'Goal deleted successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Error deleting goal:', err.stack);
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
server.listen(PORT, () => {
    console.log("Listening on port", PORT);
});


