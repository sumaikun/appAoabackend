const surveys =  require('./jsons/encuesta.json')
const act = require('./jsons/acta.json')
const queries = require("./queries");
const db = require("../config/database");
const sha1 = require('js-sha1');
//const HttpStatus = require('http-status-codes');
const jwt = require('jsonwebtoken');
const properties = require("../properties");
const moment = require('moment');
const request = require('request');
const Jimp = require('jimp')
const sizeOf = require('image-size');
const fs = require('fs');
const redis = require("redis");
const client = redis.createClient();
var readWriteClient = redis.createClient();

client.config('set','notify-keyspace-events','KEA');

client.subscribe('__keyevent@0__:set');

client.on("connect", function() {
    console.log("You are now connected to redis");
});
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

    //console.log("trying to auth",req)

    //const today = moment(new Date()).format("YYYY-MM-DD")

    const threeDaysBefore = moment(new Date()).subtract(3,'d').format("YYYY-MM-DD")

    const threeDaysAhead =moment(new Date()).add(3,'d').format("YYYY-MM-DD")

    let options = {
        url: 'https://app.aoacolombia.com/Control/operativo/webservicesAppAoa.php',
        method: 'POST',
        json: {
            APIKEYAOAAPP: "yNPlsmOGgZoGmH$8",
            see_tipo_evento: "true"        
        }
    }
    
    const eventTypesRequest = await new Promise(function (resolve, reject) {
        request(options, function(error, response, body){
            if(error) reject(null);
            else resolve(body);
        });
    })

    options = {
        url: 'https://app.aoacolombia.com/Control/operativo/webservicesAppAoa.php',
        method: 'POST',
        json: {
            APIKEYAOAAPP: "yNPlsmOGgZoGmH$8",
            see_evento_actividad: "true"        
        }
    }

    const activitiesTypesRequest = await new Promise(function (resolve, reject) {
        request(options, function(error, response, body){
            if(error) reject(null);
            else resolve(body);
        });
    })

    //console.log("eventTypes",eventTypes)

    const eventTypes = eventTypesRequest ? eventTypesRequest.tabla_eventos : []

    const activitiesTypes = activitiesTypesRequest ? activitiesTypesRequest.tabla_eventos_actividad : []
    
   try{

        let password = sha1(req.body.password);
        
        let ifAdmin = await executeQuery(queries.admin_auth,[req.body.username,password]);

        let offices , user 

        if(ifAdmin.length > 0)
        {
            const token = jwt.sign({name:ifAdmin[0].nombre}, properties.appkey, {
                expiresIn: "8h"
            });

            offices = await executeQuery(queries.get_actives_offices);

            user = {isAdmin:true,id:ifAdmin[0].id,name:ifAdmin[0].nombre,email:ifAdmin[0].email,token}
          
        }
        else{
            let ifUser = await executeQuery(queries.user_auth,[req.body.username,password]);
            console.log(ifUser);
            
            if(ifUser.length > 0)
            {

                offices = await executeQuery(queries.get_offices_by_branch,[ifUser[0].oficina]);            

                const token = jwt.sign({name:ifUser[0].nombre}, properties.appkey, {
                    expiresIn: '8h'
                });
                
                user = {isAdmin:false,id:ifUser[0].id,name:ifUser[0].nombre,email:ifUser[0].email,token}

            }
            else
            {
                res.status(401).send();
                return
            }   
        }
        
          
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
            user,
            offices,
            deliverAppointments,
            devolappointments,
            deliverInfo,
            devolInfo,
            surveys,
            act,
            eventTypes,
            activitiesTypes
        });

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

exports.createEvent = async function (req, res, next) {
    
    try{  
        const ID_EVENTO_EMPLEADO = req.body.id 
        const FECHA_EVENTO = req.body.eventDate
        const ID_TIPO_EVENTO = req.body.eventType
        const LOGITUD = req.body.longitude
        const LATITUD = req.body.latitude
        const DESCRIPCION = req.body.description
        const EVENTO_ACTIVIDAD = req.body.activityType ? req.body.activityType : null
        
        if( !ID_EVENTO_EMPLEADO || !FECHA_EVENTO || !ID_TIPO_EVENTO ||
            !LOGITUD || !LATITUD || !DESCRIPCION ){
            res.status(400).json({message: "Bad body"})
            return
        }

        options = {
            url: 'https://app.aoacolombia.com/Control/operativo/webservicesAppAoa.php',
            method: 'POST',
            json: {
                APIKEYAOAAPP: "yNPlsmOGgZoGmH$8",
                create_event: "true",
                ID_EVENTO_EMPLEADO,
                FECHA_EVENTO,
                ID_TIPO_EVENTO,
                LOGITUD,
                LATITUD,
                DESCRIPCION,
                EVENTO_ACTIVIDAD
            }
        }

        const createEventResponse = await new Promise(function (resolve, reject) {
            request(options, function(error, response, body){
                if(error) reject(null);
                else resolve(body);
            });
        })

        console.log("createEventResponse",createEventResponse)

        if(createEventResponse.estado === 1)
        {
            res.send({message:"ok"});
        }else{
            res.status(400).send();
        }

    } catch(err){
        next(err);
    }
}

exports.pendingEvents = async function (req, res, next) {
    try{  
        const ID_OPERARIO = req.body.id 
        
        if( !ID_OPERARIO  ){
            res.status(400).json({message: "Bad body"})
            return
        }

        options = {
            url: 'https://app.aoacolombia.com/Control/operativo/webservicesAppAoa.php',
            method: 'POST',
            json: {
                APIKEYAOAAPP: "yNPlsmOGgZoGmH$8",
                event_exercise: "true",
                ID_OPERARIO
            }
        }

        const pendingActivities = await new Promise(function (resolve, reject) {
            request(options, function(error, response, body){
                if(error) reject(null);
                else resolve(body);
            });
        })

        const pendingEvents = pendingActivities ? pendingActivities.evento_activo : []

        
        res.send({pendingEvents});
       

    } catch(err){
        next(err);
    }
}

exports.closeEvent = async function (req, res, next) {
    
    try{  
       
        const ID_EVENTO = req.body.id
        const FECHA_FINAL_EVENTO = req.body.closeDate

        options = {
            url: 'https://app.aoacolombia.com/Control/operativo/webservicesAppAoa.php',
            method: 'POST',
            json: {
                APIKEYAOAAPP: "yNPlsmOGgZoGmH$8",
                update_date_end: "true",
                ID_EVENTO,
                FECHA_FINAL_EVENTO
            }
        }

        const closeEventResponse = await new Promise(function (resolve, reject) {
            request(options, function(error, response, body){
                if(error) reject(null);
                else resolve(body);
            });
        })

        //console.log("closeEventResponse",closeEventResponse)

        if(closeEventResponse.estado === 1)
        {
            res.send({message:"ok"});
        }else{
            res.status(400).send();
        }

    } catch(err){
        next(err);
    }

}



exports.testingImage = async function (req, res, next) {

    try{  

        let image = new Jimp(650, 50, 'white', (err, image) => {
        if (err) throw err
        })

        let message = 'Entrega tomada: 2020-09-14 09:01:51 Cargada: 2020-09-14 09:04:32 AM Placa: FVQ202 Siniestro: 93755201'
        let x = 10
        let y = 10

        Jimp.loadFont(Jimp.FONT_SANS_12_BLACK)
        .then(font => {
            image.print(font, x, y, message)
            return image            
        }).then( async image => {
            let file = `testing.${image.getExtension()}`
            //console.log("file",__dirname+"/"+file)
            image.write(__dirname+"/files/"+file)
            try{
               // save            
                res.sendFile(__dirname+"/files/"+file);
            }catch(err){
                console.log("err",err)
                next(err);
            }
            
            //res.send({message:"ok"});
        })

        //res.send({message:"ok"});

    }catch(err){
        next(err);
    }
 
        
}

exports.testingImage2 = async function (req, res, next) { 

    var images = ['./files/cartest.jpg', './files/testing.png'];

    var jimps = [];

    for (var i = 0; i < images.length; i++) {
        jimps.push(Jimp.read(images[i]));
    }

    Promise.all(jimps).then(function(data) {
        return Promise.all(jimps);
    }).then(function(data) {
        data[0].composite(data[1],0,0);  
        data[0].composite(data[1],0,30);        

        data[0].write('./files/test.png', function() {
            console.log("wrote the image");
            res.send({message:"ok"});
        });
    });

}

exports.proccessAppointment = async function (req, res, next) { 

    console.log("proccess appointment got it")

    //It can happened that was already proccessed

    try{
        const { appointment, type, frontImageSrc,
            leftImageSrc, rightImageSrc, backImageSrc,
            odometerImageSrc, contractImageSrc,
            checkImageSrc, inventoryImageSrc, pictureTimes
        } = req.body

        let appointmentResult = await executeQuery(queries.get_appointment_info,[appointment]);

        if(!appointmentResult[0])
        {
            res.status(400).send({"message":"siniester not exist for appointment "+appointment});
            return
        }

        const siniester = appointmentResult[0].siniestro;

        const plate = appointmentResult[0].placa;

        const spanishType = type === "deliver" ? "Entrega" : "Devolucion";
        
        const now = moment().format("YYYY-MM-DD HH:mm:ss")

        const fs = require("fs");
        const dir = __dirname+"/files/app/"+type+"/"+appointment
        
        if (!fs.existsSync(dir)){        
           await fs.mkdirSync(dir);
        }

        if(frontImageSrc)
        {
            const frontImageSrcBitmap = new Buffer(frontImageSrc, 'base64');

            fs.writeFileSync(dir+"/frontImage.jpeg", frontImageSrcBitmap);

            await sleep(100)

            const dimensions = sizeOf(dir+"/frontImage.jpeg");

            //pictureTimes.frontCameraImage ,  moment().format("YYYY-MM-DD HH:mm:ss")

            let message =  `${spanishType} tomada: ${pictureTimes.frontCameraImage} Cargada: ${now} Placa: ${plate} Siniestro: ${siniester}`

            await generateImageLabel(dir,message,"frontImageLabel",dimensions.width, 50)

            await sleep(400)
    
            await mergeImages([dir+"/frontImage.jpeg",dir+"/frontImageLabel.png"],dir,"frontImageLabeled")

            //await sleep(100)

            //const base64str = base64_encode(dir+"/frontImageLabeled.png");

            //console.log("base64str",base64str)
        }

        if(leftImageSrc)
        {
            const leftImageSrcBitmap = new Buffer(leftImageSrc, 'base64');

            fs.writeFileSync(dir+"/leftImage.jpeg", leftImageSrcBitmap);

            await sleep(100)

            const dimensions = sizeOf(dir+"/leftImage.jpeg");
            
            //pictureTimes.leftCameraImage ,  moment().format("YYYY-MM-DD HH:mm:ss")
            let message =  `${spanishType} tomada: ${pictureTimes.frontCameraImage} Cargada: ${now} Placa: ${plate} Siniestro: ${siniester}`

            await generateImageLabel(dir,message,"leftImageLabel",dimensions.width, 50)

            await sleep(400)
    
            await mergeImages([dir+"/leftImage.jpeg",dir+"/leftImageLabel.png"],dir,"leftImageLabeled")
        }

        if(rightImageSrc)
        {
            const rightImageSrcBitmap = new Buffer(rightImageSrc, 'base64');
            fs.writeFileSync(dir+"/rightImage.jpeg", rightImageSrcBitmap);

            await sleep(100)

            const dimensions = sizeOf(dir+"/rightImage.jpeg");

            //pictureTimes.rightCameraImage ,  moment().format("YYYY-MM-DD HH:mm:ss")
            let message =  `${spanishType} tomada: ${pictureTimes.rightCameraImage} Cargada: ${now} Placa: ${plate} Siniestro: ${siniester}`

            await generateImageLabel(dir,message,"rightImageLabel",dimensions.width, 50)

            await sleep(400)
    
            await mergeImages([dir+"/rightImage.jpeg",dir+"/rightImageLabel.png"],dir,"rightImageLabeled")
        }

        if(backImageSrc)
        {
            const backImageSrcBitmap = new Buffer(backImageSrc, 'base64');
            fs.writeFileSync(dir+"/backImage.jpeg", backImageSrcBitmap);

            await sleep(100)

            const dimensions = sizeOf(dir+"/backImage.jpeg");

            //pictureTimes.backCameraImage ,  moment().format("YYYY-MM-DD HH:mm:ss")
            let message =  `${spanishType} tomada: ${pictureTimes.backCameraImage} Cargada: ${now} Placa: ${plate} Siniestro: ${siniester}`

            await generateImageLabel(dir,message,"backImageLabel",dimensions.width, 50)

            await sleep(400)
    
            await mergeImages([dir+"/backImage.jpeg",dir+"/backImageLabel.png"],dir,"backImageLabeled")
        }

        
        if(odometerImageSrc)
        {
            const odometerImageSrcBitmap = new Buffer(odometerImageSrc, 'base64');
            fs.writeFileSync(dir+"/odometerImage.jpeg", odometerImageSrcBitmap);

            await sleep(100)

            const dimensions = sizeOf(dir+"/odometerImage.jpeg");
            //pictureTimes.odometerCameraImage ,  moment().format("YYYY-MM-DD HH:mm:ss")
            let message =  `${spanishType} tomada: ${pictureTimes.odometerCameraImage} Cargada: ${now} Placa: ${plate} Siniestro: ${siniester}`

            await generateImageLabel(dir,message,"odometerImageLabel",dimensions.width, 50)

            await sleep(400)
    
            await mergeImages([dir+"/odometerImage.jpeg",dir+"/odometerImageLabel.png"],dir,"odometerImageLabeled")
        }

        if(contractImageSrc)
        {
            const contractImageSrcBitmap = new Buffer(contractImageSrc, 'base64');
            fs.writeFileSync(dir+"/contractImage.jpeg", contractImageSrcBitmap);

            await sleep(100)

            const dimensions = sizeOf(dir+"/contractImage.jpeg");
            //pictureTimes.contractImage ,  moment().format("YYYY-MM-DD HH:mm:ss")
            let message =  `${spanishType} tomada: ${pictureTimes.contractImage} Cargada: ${now} Placa: ${plate} Siniestro: ${siniester}`

            await generateImageLabel(dir,message,"contractImageLabel",dimensions.width, 50)

            await sleep(400)
    
            await mergeImages([dir+"/contractImage.jpeg",dir+"/contractImageLabel.png"],dir,"contractImageLabeled")
        }
        
        if(checkImageSrc)
        {
            const checkImageSrcBitmap = new Buffer(checkImageSrc, 'base64');
            fs.writeFileSync(dir+"/checkImage.jpeg", checkImageSrcBitmap);

            await sleep(100)

            const dimensions = sizeOf(dir+"/checkImage.jpeg");
            //pictureTimes.checkCameraImage ,  moment().format("YYYY-MM-DD HH:mm:ss")
            let message =  `${spanishType} tomada: ${pictureTimes.checkCameraImage} Cargada: ${now} Placa: ${plate} Siniestro: ${siniester}`

            await generateImageLabel(dir,message,"checkImageLabel",dimensions.width, 50)

            await sleep(400)
    
            await mergeImages([dir+"/checkImage.jpeg",dir+"/checkImageLabel.png"],dir,"checkImageLabeled")
        }
        

        if(inventoryImageSrc)
        {
            const inventoryImageSrcBitmap = new Buffer(inventoryImageSrc, 'base64');
            fs.writeFileSync(dir+"/inventoryImage.jpeg", inventoryImageSrcBitmap);

            await sleep(100)

            const dimensions = sizeOf(dir+"/inventoryImage.jpeg");

            let message =  `${spanishType} tomada: ${pictureTimes.inventoryCameraImage} Cargada: ${now} Placa: ${plate} Siniestro: ${siniester}`

            await generateImageLabel(dir,message,"inventoryImageLabel",dimensions.width, 50)

            await sleep(400)
    
            await mergeImages([dir+"/inventoryImage.jpeg",dir+"/inventoryImageLabel.png"],dir,"inventoryImageLabeled")
        }
        
        readWriteClient.set("proccessImagesAppointment",JSON.stringify({ type, appointment }))

        res.send({message:"ok"});

    }catch(err){
        next(err);
    }    

}

async function generateImageLabel(dir,message,name,width,height){

        return new Promise(
            function(resolve, reject) {

                try{

                    let image = new Jimp(width, height, 'white', (err, image) => {
                        if (err) throw err
                    })            
                    
                    let x = 10
                    let y = 10
            
                    Jimp.loadFont(Jimp.FONT_SANS_12_BLACK)
                    .then(font => {
                        image.print(font, x, y, message)
                        return image            
                    }).then( async image => {
                        try{
                            let file = `/${name}.${image.getExtension()}`
                            console.log("file",dir+file)
                            image.write(dir+file,error => console.error("error label:",error))                                             
                            resolve(true)                           
                        }catch(err){
                            console.log("err",err)
                            reject(false)
                        }
                    })

                }catch(err){
                    console.log("err",err)
                    reject(false)
                }            

            }
        )        
}

async function mergeImages(images,dir,name) { 

    return new Promise(

        function(resolve,reject) {
            var jimps = [];

            for (var i = 0; i < images.length; i++) {
                jimps.push(Jimp.read(images[i]));
            }

            Promise.all(jimps).then(function(data) {
                return Promise.all(jimps);
            }).then(function(data) {
                data[0].composite(data[1],0,0);  
                //data[0].composite(data[1],0,30);        
                let file = `/${name}.png`
                data[0].write(dir+file, function() {
                    console.log("wrote merge image");
                    resolve(true) 
                });
            }).catch(function(error){
                console.error("mergin error",error)
                reject(false)
            });
        }
    )

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}


// redis example

/*client.set("student", "Laylaa");

client.get('student', function(err, reply) {
    console.log("reply",reply);
})*/

client.on('message', function(channel, key) {
    // do what you want when a value is updated
    console.log("channel",channel,"key",key)
    switch (key) {
        case "proccessImagesAppointment":
            readWriteClient.get(key, function(err, value) {
                console.log("proccessImagesAppointment",value);

                const objectVlue = JSON.parse(value)

                const { type, appointment } = objectVlue 

                const dir = __dirname+"/files/app/"+type+"/"+appointment
                const base64str = base64_encode(dir+"/frontImageLabeled.png");
                console.log("base64str",base64str)
             });
            break        
        default:
            break
    }
});

/*client.on('proccessAppointmentsImages', function(err, reply) {
    console.log("reply",reply);
})*/