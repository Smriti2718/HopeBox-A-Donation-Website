require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const { MongoClient, ObjectId } = require('mongodb');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');

const app = express();

// MongoDB collections
let usersCollection;

// MongoDB connection
const client = new MongoClient(process.env.MONGODB_URL);
let db;
let donationsCollection;

async function connectToMongo() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        // Use the correct database name from your cluster
        db = client.db('HopeBox');
        donationsCollection = db.collection('Donations');
        usersCollection = db.collection('Users');
        
        // Create indexes for better performance
        await donationsCollection.createIndex({ date: -1 });
        await usersCollection.createIndex({ email: 1 }, { unique: true });
        await usersCollection.createIndex({ username: 1 }, { unique: true });
        console.log('Connected to donations database and collection');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}

connectToMongo();

// Middleware
app.use(express.json());
app.use(express.static(__dirname));
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: true,
    saveUninitialized: true,
    rolling: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true,
        secure: false // set to true if using HTTPS
    }
}));

// Routes
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user document
        const newUser = {
            username,
            email,
            password: hashedPassword,
            createdAt: new Date()
        };

        // Insert into MongoDB
        const result = await usersCollection.insertOne(newUser);
        
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        // Check for duplicate key errors
        if (error.code === 11000) {
            if (error.keyPattern.email) {
                return res.status(400).json({ error: 'Email already exists' });
            }
            if (error.keyPattern.username) {
                return res.status(400).json({ error: 'Username already exists' });
            }
        }
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await usersCollection.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Set session and save it
        req.session.userId = user._id.toString();
        
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ error: 'Failed to create session' });
            }
            res.json({ message: 'Logged in successfully', userId: user._id.toString() });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/profile', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        // Find user by ID
        const user = await usersCollection.findOne({ _id: new ObjectId(req.session.userId) });
        
        if (!user) {
            // Clear invalid session
            req.session.destroy();
            return res.status(404).json({ error: 'User not found' });
        }

        // Don't send password in response
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check auth status
app.get('/api/auth/status', (req, res) => {
    if (req.session.userId) {
        res.json({ authenticated: true });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});


// Handle item donations
app.post('/api/donate-item', async (req, res) => {
    try {
        const donationId = uuidv4();
        const donation = {
            donationId,
            ...req.body,
            date: new Date(),
            status: 'pending',
            type: 'item'
        };
        
        const result = await donationsCollection.insertOne(donation);
        console.log('Item donation saved:', result);
        res.status(201).json({ message: 'Item donation recorded successfully', donationId });
    } catch (error) {
        console.error('Item donation error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/generate-receipt', async (req, res) => {
    try {
        const { receiptId, name, email, contact, location, category, description, quantity } = req.query;

        // Create a new PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=donation-receipt-${receiptId}.pdf`);

        // Pipe the PDF document to the response
        doc.pipe(res);

        // Add logo
        // doc.image('logo.png', 50, 50, { width: 100 }); // Uncomment this if you have a logo.png file

        // Add header
        doc.fontSize(25)
           .text('HopeBox Donation Receipt', { align: 'center' })
           .moveDown();

        // Add receipt ID and date
        doc.fontSize(12)
           .text(`Receipt ID: ${receiptId}`, { align: 'right' })
           .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' })
           .moveDown();

        // Add donor information
        doc.fontSize(16)
           .text('Donor Information', { underline: true })
           .moveDown(0.5);

        doc.fontSize(12)
           .text(`Name: ${name}`)
           .text(`Email: ${email}`)
           .text(`Contact: ${contact}`)
           .text(`Location: ${location}`)
           .moveDown();

        // Add donation details
        doc.fontSize(16)
           .text('Donation Details', { underline: true })
           .moveDown(0.5);

        doc.fontSize(12)
           .text(`Category: ${category}`)
           .text(`Quantity: ${quantity}`)
           .text(`Description: ${description}`)
           .moveDown();

        // Add thank you message
        doc.moveDown()
           .fontSize(14)
           .text('Thank you for your generous donation!', { align: 'center' })
           .text('Your contribution will make a difference in someone\'s life.', { align: 'center' })
           .moveDown();

        // Add footer
        doc.fontSize(10)
           .text('HopeBox - Connecting Hearts, Sharing Hope', { align: 'center', color: 'grey' });

        // Finalize the PDF
        doc.end();

    } catch (error) {
        console.error('Error generating receipt:', error);
        res.status(500).json({ error: 'Failed to generate receipt' });
    }
});


app.get('/profile', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'profile.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
