const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

passport.serializeUser(function (user, done) {
    done(null, user.oid);
});

passport.deserializeUser(function (oid, done) {
    findByOid(oid, function (err, user) {
        done(err, user);
    });
});

// array to hold logged in users
let users = [];

const findByOid = function (oid, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        console.log('we are using user: ', user);
        if (user.oid === oid) {
            return fn(null, user);
        }
    }
    return fn(null, null);
};

passport.use(new OIDCStrategy({
    "identityMetadata": "https://login.microsoftonline.com/comcastcorp.onmicrosoft.com/v2.0/.well-known/openid-configuration",
    "clientID": "7eea283b-559e-412b-bbe9-220ec481bec2",
    "responseType": "code id_token",
    "responseMode": "form_post",
    "redirectUrl": "http://localhost:3000/oauth/account",
    "allowHttpForRedirectUrl": true,
    "clientSecret": "hetgVHC1::zguUSML0824|]",
    "validateIssuer": false,
    "issuer": null,
    "passReqToCallback": false,
    "scope": [
        "profile",
        "offline_access",
        "https://graph.microsoft.com/mail.read"
    ],
    "loggingLevel": "info",
    "nonceLifetime": null,
    "nonceMaxAmount": 5,
    "useCookieInsteadOfSession": true,
    "cookieEncryptionKeys": [
        {
            "key": "12345678901234567890123456789012",
            "iv": "123456789012"
        },
        {
            "key": "abcdefghijklmnopqrstuvwxyzabcdef",
            "iv": "abcdefghijkl"
        }
    ],
    "clockSkew": null
}, function (iss, sub, profile, accessToken, refreshToken, done) {
    if (!profile.oid) {
        return done(new Error("No oid found"), null);
    }
    // asynchronous verification, for effect...
    process.nextTick(function () {
        findByOid(profile.oid, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                // "Auto-registration"
                users.push(profile);
                return done(null, profile);
            }
            return done(null, user);
        });
    });
}
));