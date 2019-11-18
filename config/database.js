var mysql = require('mysql');

var properties = require("../properties");

var pool = mysql.createPool({
    host     : properties.HOST,
    user     : properties.username,
    password : properties.password,
    database : properties.DB,
    port     : properties.MYSQL_PORT
});


exports.connection = {
    query: function () {
        var queryArgs = Array.prototype.slice.call(arguments),
            events = [],
            eventNameIndex = {};

        

        pool.getConnection(function (err, conn) {
            if (err) {
                if (eventNameIndex.error) {
                    eventNameIndex.error();
                }
            }
            if (conn) {                
                var q = conn.query.apply(conn, queryArgs);
                q.on('end', function () {                    
                    conn.release();
                });                              
                events.forEach(function (args) {
                    q.on.apply(q, args);
                });
            }
        });

        return {
            on: function (eventName, callback) {
                events.push(Array.prototype.slice.call(arguments));
                eventNameIndex[eventName] = callback;
                return this;
            }
        };
    }
};




/*db.connection.query("SELECT * FROM `table` WHERE `id` = ? ", row_id)
          .on('result', function (row) {
            setData(row);
          })
          .on('error', function (err) {
            callback({error: true, err: err});
          });
*/

