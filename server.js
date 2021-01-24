var express = require('express');
var bodyParser = require('body-parser');
var properties = require("./properties");
var appRoutes = require("./api/appRoutes");
var app = express();
var bodyParserJSON = bodyParser.json({limit: '100mb'});
var bodyParserURLEncoded = bodyParser.urlencoded({extended:true});
var timeout = require('connect-timeout');

var router = express.Router();


app.use(timeout('100s'));
app.use(bodyParserJSON);
app.use(bodyParserURLEncoded);

// Error handling
app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
   res.setHeader("Access-Control-Allow-Credentials", "true");
   res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
   res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Origin,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,Authorization");
 next();
});

// use express router
app.use('/api',router);
//call app routing
appRoutes(router);

//error handler
/*function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
}

app.use(errorHandler);*/

app.use(function(err, req, res, next) {  
  
  res.status(500).send({ error: err.message });
});

// intialise server
app.listen(properties.API_PORT, (req, res) => {
  console.log(`Server is running on ${properties.API_PORT} port.`);  
})



