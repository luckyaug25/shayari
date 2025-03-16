require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// PostgreSQL Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Home Page - Display Shayari
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM shayari ORDER BY created_at DESC');
        res.render('index', { shayariList: result.rows });
    } catch (err) {
        console.error(err);
        res.send('Error loading Shayari');
    }
});

// Upload Page - Render Upload Form
app.get('/upload', (req, res) => {
    res.render('upload');
});

// Handle Shayari Upload
app.post('/upload', async (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.redirect('/upload');
    }
    try {
        await pool.query('INSERT INTO shayari (content) VALUES ($1)', [content]);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.send('Error uploading Shayari');
    }
});

// Delete Shayari
app.post('/delete/:id', async (req, res) => {
    const shayariId = req.params.id;
    try {
        await pool.query('DELETE FROM shayari WHERE id = $1', [shayariId]);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.send('Error deleting Shayari');
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
