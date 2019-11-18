const appMethods = require("./appController");
const md = require("../middleware/middlewares");

module.exports = function(router) {
    router.post('/auth', appMethods.authUser);
    router.get('/offices', md.authenticated, appMethods.getOffices);
    router.get('/officesbranch/:branch', md.authenticated, appMethods.getOfficesByBranch);
    router.get('/officesbranch/:branch', md.authenticated, appMethods.getOfficesByBranch);    
}


    /*router.post('/create', Heros.createHero);
    router.get('/get', Heros.getHeros);
    router.get('/get/:name', Heros.getHero);
    router.put('/update/:id', Heros.updateHero);
    router.delete('/remove/:id', Heros.removeHero);*/
