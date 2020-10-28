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

    //Testing images
    router.post('/proccessDeliverAppointment', appMethods.proccessDeliverAppointment);
    router.post('/proccessDevolutionAppointment', appMethods.proccessDevolutionAppointment);

    //Testing images
    router.post('/testingImage', appMethods.testingImage);
    router.post('/testingImage2', appMethods.testingImage2);
}


    /*router.post('/create', Heros.createHero);
    router.get('/get', Heros.getHeros);
    router.get('/get/:name', Heros.getHero);
    router.put('/update/:id', Heros.updateHero);
    router.delete('/remove/:id', Heros.removeHero);*/
