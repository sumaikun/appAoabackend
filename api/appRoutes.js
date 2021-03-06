const appMethods = require("./appController");
const md = require("../middleware/middlewares");

module.exports = function(router) {
    router.post('/auth', appMethods.authUser);
    router.get('/offices', md.authenticated, appMethods.getOffices);
    router.get('/officesbranch/:branch', md.authenticated, appMethods.getOfficesByBranch);
    router.get('/officesbranch/:branch', md.authenticated, appMethods.getOfficesByBranch);  
    router.get('/getAppointmentSiniesterInfo/:idappointment', md.authenticated, appMethods.siniesterInfo);
    
    //for filters
    router.get('/getAppointmentsDeliver/:office/:date', md.authenticated, appMethods.getAppointmentsDeliver);  
    router.get('/getAppointmentsDevol/:office/:date', md.authenticated, appMethods.getAppointmentsDevol);  

    // Events services
    router.post('/createEvent', md.authenticated, appMethods.createEvent);
    router.post('/pendingEvents', md.authenticated, appMethods.pendingEvents);
    router.post('/closeEvent', md.authenticated, appMethods.closeEvent);

    //App images
    router.post('/proccessAppointment',md.authenticated, appMethods.proccessAppointment);
    router.post('/sendToqueue', md.authenticated, appMethods.sendToqueue);

    //Testing images
    router.post('/testingImage', appMethods.testingImage);
    router.post('/testingImage2', appMethods.testingImage2);

    //Check operator assign to appointment

    router.post('/assignOperatorDeliver', md.authenticated, appMethods.assignOperatorDeliver);
    router.get('/checkIfOperatorDeliver/:operatorId/:appointment', md.authenticated, appMethods.checkIfOperatorDeliver);

    router.post('/assignOperatorDevolution', md.authenticated, appMethods.assignOperatorDevolution);
    router.get('/checkIfOperatorDevolution/:operatorId/:appointment', md.authenticated, appMethods.checkIfOperatorDevolution);

    //check kilometers
    router.post('/checkKilometers', md.authenticated, appMethods.checkKilometers);
}


    /*router.post('/create', Heros.createHero);
    router.get('/get', Heros.getHeros);
    router.get('/get/:name', Heros.getHero);
    router.put('/update/:id', Heros.updateHero);
    router.delete('/remove/:id', Heros.removeHero);*/
