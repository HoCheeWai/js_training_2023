const express = require('express');
const ejs = require('ejs');
const dotenv = require('dotenv').config();
const mysql = require('mysql2/promise');

const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({
    extended: false
}));
app.set('view engine', 'ejs');

const dbConfig = {
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE};

async function main() {
    try {
        const db = await mysql.createConnection(dbConfig);
        console.log("Connected to database");

        app.get('/', async function(req,res) {
            const [artists] = await db.query("SELECT * FROM artists");
            res.render("artists", {
                "artists": artists
            });
        });


        app.get('/artists/create', function(req,res) {
            res.render('create_artist');
        });

        app.post('/artists/create', async (req, res) => {
            const { name, birth_year, country } = req.body;
            await db.query(
            'INSERT INTO artists (name, birth_year, country) VALUES (?, ?, ?)', 
            [name, birth_year, country]);
            res.redirect('/');
        });

        app.post('/artists/:artist_id/update', async (req, res) => {
            const { name, birth_year, country, preferred_medium } = req.body;
            const { artist_id } = req.params;
            const sql = 'UPDATE artists SET name = ?, birth_year = ?, country = ?, preferred_medium = ? WHERE id = ?';
            await db.query(sql, [name, birth_year, country, preferred_medium, artist_id]);
            res.redirect('/');
        });


        app.get('/artists/:artist_id/update', async (req, res) => {
            const {artist_id} = req.params;
            const sql = "SELECT * FROM artists WHERE id = ?";
            const [artists] = await db.query(sql, [artist_id]);
            const artist = artists[0];
            res.render('update_artist', {
                artist
            });
        });

        app.get('/artists/:artist_id/delete', async function(req,res){
            const {artist_id} = req.params;
            const sql = "SELECT * FROM artists WHERE id = ?";
            // whenever we do a SELECT we always have an array
            const [artists] = await db.query(sql, [artist_id]);
            const artist = artists[0];
            res.render('confirm_delete', {
                artist
            })
         })
    
         app.post('/artists/:artist_id/delete', async function(req,res){
            const {artist_id} = req.params;
            const sql = "DELETE FROM artists WHERE id = ?";
            await db.query(sql, [artist_id]);
            res.redirect('/');
         });

        app.get('/register', function(req,res){
            res.render('register');
        });

        app.post('/register', async function(req,res){
            const {username, email, password} = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            const sql = "INSERT INTO users (username, password, email, role_id) VALUES (?, ?, ?, 4)";
            await db.query(sql, [username, hashedPassword, email]);
            res.redirect('/login');
         });
    
         app.get('/login', function(req,res){
            res.render('login')
         });



    } catch {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
    
}

main();

app.listen(process.env.port || 3000, function(){
    console.log("server has started");
})