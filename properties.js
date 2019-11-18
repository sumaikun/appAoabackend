const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    API_PORT: 3000,
    MYSQL_PORT : 3306,
    DB : 'aoacol_aoacars',
    HOST : process.env.MYSQL_HOST,
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    appkey: "43fc96f50b590cc7b18d6d1cc00465b85e138ed4"
}