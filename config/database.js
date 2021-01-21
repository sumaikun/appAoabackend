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

        //console.log("queryArgs",queryArgs)

        pool.getConnection(function (err, conn) {
            if (err) {
                if (eventNameIndex.error) {
                    eventNameIndex.error();
                }
            }
            if (conn) {
                
                //console.log(conn.format(queryArgs))

                //console.log("in connection-----------------")
                
                const sql = conn.format(...queryArgs);
                //console.log("sql",sql);
                
                var q = conn.query.apply(conn, queryArgs);
                q.on('end', function () {                    
                    conn.release();
                    //console.log("in end connection-----------------")
                });                              
                events.forEach(function (args) {
                    //console.log("in events-----------------")
                    q.on.apply(q, args);
                });
            }
        });

        return {
            on: function (eventName, callback) {
                //console.log("in on function -----------------")
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

