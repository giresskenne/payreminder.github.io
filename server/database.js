const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./payreminder.db');

// Créer les tables si elles n'existent pas
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        name TEXT,
        amount REAL,
        dueDate TEXT,
        FOREIGN KEY(userId) REFERENCES users(id)
    )`);
});

// Ajouter un nouvel utilisateur
exports.createUser = (username, email, password) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) reject(err);
            db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`, [username, email, hash], function(err) {
                if (err) reject(err);
                resolve({ id: this.lastID });
            });
        });
    });
};

// Authentifier un utilisateur
exports.authenticateUser = (email, password) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
            if (err) reject(err);
            if (!user) reject(new Error('Utilisateur non trouvé'));
            bcrypt.compare(password, user.password, (err, res) => {
                if (err) reject(err);
                if (!res) reject(new Error('Mot de passe incorrect'));
                resolve(user);
            });
        });
    });
};

// Récupérer les informations d'un utilisateur par son ID
exports.getUserById = (id) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, user) => {
            if (err) reject(err);
            if (!user) reject(new Error('Utilisateur non trouvé'));
            db.all(`SELECT * FROM payments WHERE userId = ?`, [id], (err, payments) => {
                if (err) reject(err);
                user.payments = payments;
                resolve(user);
            });
        });
    });
};
