const queries = require("./queries");
const db = require("../config/database");
const sha1 = require('js-sha1');
//const HttpStatus = require('http-status-codes');
const jwt = require('jsonwebtoken');
const properties = require("../properties");
const moment = require('moment');


//funcion para ejecutar consultas a la base de datos, de esta manera se evita el uso del callback
//y hay un mejor manejo de errores
function executeQuery(query, ...args) {
    return new Promise( (resolve , reject) => {
        
            db.connection.query(query, ...args,(error,results)=>{
                resolve(results);
            })
                .on('result', function (row) {
                    //console.log("rows");  
                    //console.log(row);            
                })
                .on('error', function (err) {
                    //console.log("error");
                    //console.log(err);
                    reject(err);
                });        
        }
    );
    
}

exports.authUser = async function (req, res, next) {

    try{

        let password = sha1(req.body.password);
        
        let ifAdmin = await executeQuery(queries.admin_auth,[req.body.username,password]);        
        
        if(ifAdmin.length > 0)
        {
            const token = jwt.sign({name:ifAdmin[0].nombre}, properties.appkey, {
                expiresIn: 1800
            });

            let offices = await executeQuery(queries.get_actives_offices);

            console.log(moment(new Date()).format("YYYY-MM-DD"));

            let deliverAppointments = await executeQuery(queries.get_deliver_appointments,[1, moment(new Date()).format("YYYY-MM-DD") ]);

            let devolappointments = await executeQuery(queries.get_devol_appointments,[1, moment(new Date()).format("YYYY-MM-DD") ]);

            res.send({
                user:{isAdmin:true,id:ifAdmin[0].id,name:ifAdmin[0].nombre,email:ifAdmin[0].email,token},
                offices,
                deliverAppointments,
                devolappointments
            });
        }
        else{
            let ifUser = executeQuery(queries.user_auth,[req.body.username,password]);
            console.log(ifUser);
            
            if(ifUser.length > 0)
            {
                const token = jwt.sign({name:ifAdmin[0].nombre}, properties.appkey, {
                    expiresIn: 1800
                });
                res.send({message:"a message",token});
            }
            else
            {
                res.status(204).send();
            }   
        } 

    }catch(err){
        next(err);
    }
 
        
} 


exports.getOffices = async function (req, res, next) {

    try{       
        
        let offices = await executeQuery(queries.get_actives_offices);        
        
        if(offices.length > 0)
        {
            res.send({offices});
        }
        else{
            res.status(204).send();
        }

    }catch(err){
        next(err);
    } 
        
}

exports.getOfficesByBranch = async function (req, res, next) {

    try{        

        let offices = await executeQuery(queries.get_offices_by_branch,req.params.branch);        
        
        if(offices.length > 0)
        {
            res.send({offices});
        }
        else{
            res.status(204).send();
        }

    }catch(err){
        next(err);
    }
 
        
} 


exports.deliverAppointments = async function (req, res, next) {

    try{  

        let appointments = await executeQuery(queries.get_deliver_appointments,[req.params.office, req.params.date]);        
        
        if(appointments.length > 0)
        {
            res.send({offices});
        }
        else{
            res.status(204).send();
        }

    }catch(err){
        next(err);
    }
 
        
}



exports.devolutionAppointments = async function (req, res, next) {

    try{  

        let appointments = await executeQuery(queries.get_devol_appointments,[req.params.office, req.params.date]);        
        
        if(appointments.length > 0)
        {
            res.send({offices});
        }
        else{
            res.status(204).send();
        }

    }catch(err){
        next(err);
    }
 
        
}

exports.siniesterInfo = async function (req, res, next) {

    try{  

        let siniester = await executeQuery(queries.get_siniester_info,);        
        
        if(appointments.length > 0)
        {
            res.send({siniester});
        }
        else{
            res.status(204).send();
        }

    }catch(err){
        next(err);
    }
 
        
}