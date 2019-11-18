const jwt = require('jsonwebtoken');
const properties = require("../properties");

exports.authenticated = function(req, res, next){
    const token = req.headers['access-token']; 
    if (token) {
      jwt.verify(token, properties.appkey, (err, decoded) => {      
        if (err) {
          return res.status(403).send({message:"invalid token"});    
        } else {
          req.decoded = decoded;    
          next();
        }
      });
    } else {
        res.status(403).send({message:"no token"});
    }
 }