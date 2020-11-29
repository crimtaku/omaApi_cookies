
// Asenna ensin express npm install express --save

var express = require('express');
var app = express();

var fs = require("fs");

var cookieParser = require('cookie-parser');

var session = require('express-session')

app.use(cookieParser());

var bodyParser = require('body-parser');

const http = require('http');
const url = require('url');

const hostname = '127.0.0.1';
const port = process.env.PORT || 3002;

// Luodaan sessiolle tunniste, joka kestää maxAgen verran.
app.use(session({secret: 'keyboard cat', cookie: {maxAge: 60000}})); //~60 sekuntia
// Huom, tällä luotu sessio ei ole turvallinen vaan periaatteessa kaikkien luettavissa. 
// Lisätietoa: https://www.npmjs.com/package/express-session#cookiesecure


app.use(express.static(__dirname + '/public'));

var user = {
    userName: "Testi",
    loginTime: Date.now(),
    UserId: 1234
}

//CORS middleware
var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    //   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    //   res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

app.use(allowCrossDomain);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(express.static('public'));

// Tällä tavalla saadaan itse talletettua keksi selaimelle
app.post('/login', (req, res)=>{
    user.session = req.sessionID;
    user.userName=req.body.fname
    res.cookie("userData", user);
    res.send("Käyttäjä lisätty");
});

// Tällä tavoin saadaan poistettua keksi
app.get('/logout', (req, res)=>{
    res.clearCookie("userData");
    res.send("Käyttäjä poistettu");
});

// Saadaan tämän palvelimen ja selaimen väliset keksit näkyviin
app.get('/getCookies', (req, res)=>{
    console.log(req.cookies);
    res.send(req.cookies);
})

app.get('/', function (req, res, next) {
    if (req.cookies.userData) {
        if (req.cookies.userData.session == req.sessionID){
            req.session.views++
            res.setHeader('Content-Type', 'text/html')
            res.write('<p>Sessionaikaisia tarkasteluja: ' + req.session.views + '</p>')
            res.write('<p>Sessio loppuu: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
        }
        else {
            res.setHeader('Content-Type', 'text/html')
            res.write("<p> Sessio on vanhentunut </p>");
        }
        res.write(`<form action="/logout">
        <input type="submit" value="Kirjaudu ulos" />
    </form>`)
        //res.write('<a href="/logout">Kirjaudu ulos</a>')
        res.end()    
    }
    else {
        req.session.views = 1 // Tallennetaan sessiotietoon muuttuja views, jolloin se poistuu ajan kanssa
        res.setHeader('Content-Type', 'text/html')
        res.end(`<form action="/login" method="post">
        <label for="fname">First name:</label><br>
        <input type="text" id="fname" name="fname" value="Etunimi"><br>
        <label for="lname">Last name:</label><br>
        <input type="text" id="lname" name="lname" value="Sukunimi"><br><br>
        <input type="submit" value="Submit">
      </form> `)
    }
})

app.listen(port, hostname, () => {
    console.log(`Server running AT http://${hostname}:${port}/`);
});