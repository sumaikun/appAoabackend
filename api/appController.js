const surveys =  require('./jsons/encuesta.json')
const act = require('./jsons/acta.json')

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
                    //console.log("query generated",this.sql)            
                })
                .on('error', function (err) {
                    reject(err);
                });        
        }
    );
    
}

exports.authUser = async function (req, res, next) {


    //const today = moment(new Date()).format("YYYY-MM-DD")

    const threeDaysBefore = moment(new Date()).subtract(3,'d').format("YYYY-MM-DD")

    const threeDaysAhead =moment(new Date()).add(3,'d').format("YYYY-MM-DD")

    try{

        let password = sha1(req.body.password);
        
        let ifAdmin = await executeQuery(queries.admin_auth,[req.body.username,password]);        
        
        if(ifAdmin.length > 0)
        {
            const token = jwt.sign({name:ifAdmin[0].nombre}, properties.appkey, {
                expiresIn: "8h"
            });

            let offices = await executeQuery(queries.get_actives_offices);
            
            let officesIndex = [];

            offices.forEach( office => {
                officesIndex.push(office.id)
            });

            let deliverAppointments = await executeQuery(queries.get_deliver_appointments_by_dates,[[officesIndex], threeDaysBefore , threeDaysAhead ]);

            let devolappointments = await executeQuery(queries.get_devol_appointments_by_dates,[[officesIndex], threeDaysBefore , threeDaysAhead ]);

            let deliverInfoIds = [];

            deliverAppointments.forEach( deliver => {
                deliverInfoIds.push(deliver.citaid)
            })
            
            let devolInfoIds = [];

            devolappointments.forEach( devol => {
                devolInfoIds.push(devol.citaid)
            })

            //devolInfoIds = devolInfoIds.substring(0, devolInfoIds.length - 1);

            let deliverInfo = deliverInfoIds.length > 0 ? await executeQuery(queries.get_siniester_info,[[deliverInfoIds]]) : [];          

            let devolInfo = devolInfoIds.length > 0 ? await executeQuery(queries.get_siniester_info,[[devolInfoIds]]) : [];

            res.send({
                user:{isAdmin:true,id:ifAdmin[0].id,name:ifAdmin[0].nombre,email:ifAdmin[0].email,token},
                offices,
                deliverAppointments,
                devolappointments,
                deliverInfo,
                devolInfo,
                surveys,
                act
            });
        }
        else{
            let ifUser = executeQuery(queries.user_auth,[req.body.username,password]);
            console.log(ifUser);
            
            if(ifUser.length > 0)
            {
                const token = jwt.sign({name:ifAdmin[0].nombre}, properties.appkey, {
                    expiresIn: 28800
                });
                res.send({message:"a message",token});
            }
            else
            {
                res.status(401).send();
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

        let parameterArray = []

        parameterArray.push(Number(req.params.idappointment))

        let siniester = await executeQuery(queries.get_siniester_info,[[parameterArray]]);             
        
        if(siniester.length == 1)
        {
            res.send({siniester:siniester});
        }
        else{
            res.status(204).send();
        }

    }catch(err){
        next(err);
    }
        
}

exports.getAppointmentsDeliver = async function (req, res, next) {
    
    try{  

        let parameterArray = []

        parameterArray.push(Number(req.params.office))

        let appointments = await executeQuery(queries.get_deliver_appointments,[[parameterArray],req.params.date]);             
        
        if(appointments.length > 0)
        {
            res.send({appointments});
        }
        else{
            res.status(204).send();
        }

    }catch(err){
        next(err);
    }

}


exports.getAppointmentsDevol = async function (req, res, next) {
    
    try{  

        let parameterArray = []
        
        parameterArray.push(Number(req.params.office))

        let appointments = await executeQuery(queries.get_devol_appointments,[[parameterArray],req.params.date]);             
        
        if(appointments.length > 0)
        {
            res.send({appointments});
        }
        else{
            res.status(204).send();
        }

    }catch(err){
        next(err);
    }

}

