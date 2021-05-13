const passport = require('passport');
const express = require("express");
const bodyParser = require("body-parser");
const OAuth2Strategy = require("passport-oauth2");
const request = require("request");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(passport.initialize());
app.use(passport.session());

app.use(require('express-session')({
    secret: "top_secret",
    name: 'session',
    saveUninitialized: true,
    resave: true,
    cookie: {
        secure: false,
        maxAge: (24 * 60 * 60 * 1000) * 30
    }
}));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

const clientId = "1";
const secretKey = "1";

passport.use(new OAuth2Strategy({
        authorizationURL: 'https://quavergame.com/oauth2/authorize',
        tokenURL: 'https://quavergame.com/oauth2/token',
        clientID: clientId,
        clientSecret: secretKey,
        callbackURL: "http://localhost:3333/auth/quaver/callback"
    },
    async function (accessToken, refreshToken, profile, cb) {
        const response = await new Promise(resolve => {
            request.post(`https://quavergame.com/oauth2/me`, {
                headers: {
                    "Authorization": "Bearer " + secretKey
                },
                body: {
                    code: accessToken
                },
                json: true
            }, function (error, response, body) {
                resolve(body);
            });
        }).then(body => body);

        cb(null, response.user);
    }
));

app.get('/auth/quaver', passport.authenticate('oauth2'));

app.get('/auth/quaver/callback',
    passport.authenticate('oauth2', {failureRedirect: '/login'}),
    function (req, res) {
        res.redirect('/');
    });

app.get("/", function (req, res) {
    res.json(req.session);
})

const port = 3333;
app.listen(port, () => console.log(`http://localhost:${port}`));
