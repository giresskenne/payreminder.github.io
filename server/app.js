const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(session({
    secret: 'payreminder_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Passer à true en production avec HTTPS
}));

// Serve static files
app.use(express.static('public'));

// Routes
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    db.createUser(username, email, password)
        .then(user => {
            req.session.userId = user.id;
            res.json({ success: true });
        })
        .catch(error => res.json({ success: false, message: error.message }));
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.authenticateUser(email, password)
        .then(user => {
            req.session.userId = user.id;
            res.json({ success: true });
        })
        .catch(error => res.json({ success: false, message: error.message }));
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            res.json({ success: false, message: 'Erreur lors de la déconnexion' });
        } else {
            res.json({ success: true });
        }
    });
});

app.get('/user', (req, res) => {
    if (!req.session.userId) {
        return res.json({ success: false });
    }
    db.getUserById(req.session.userId)
        .then(user => {
            res.json({ success: true, username: user.username, payments: user.payments });
        })
        .catch(error => res.json({ success: false, message: error.message }));
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
