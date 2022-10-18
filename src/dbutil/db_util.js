const mysql = require('mysql')

const logger = require('../logger/logger');

var DBUtil = function () {

    //Initialising DB configuration
    this.mysqlConnection = mysql.createConnection({
        host: '127.0.0.1',
        port: '3306',
        user: 'jayram',
        password: 'Madhubani@1',
        database: 'empstrapi'
    })


    //Making connection to DB
    this.mysqlConnection.connect((err) => {
        if (!err)
            logger.info('DB connection succeded.')
        else
            logger.info('DB connection failed \n Error : ' + JSON.stringify(err, undefined, 2))
    })


    //Generic insert queue
    this.insertQuery = function (_table, qs) {
        logger.info("insertQuery. Table: " + _table + " Values: " + JSON.stringify(qs))
        var curDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        qs.created_at = curDate;
        qs.updated_at = curDate;

        var col = [];
        var _value = [];
        for (key in qs) {
            col.push(key)
            _value.push(typeof qs[key] === "object" ? JSON.stringify(qs[key]) : qs[key])
        }

        this.mysqlConnection.query("INSERT INTO " + _table + " ( " + col.toString() + " ) VALUES ( ? )", [_value], (error, rows, fields) => {
            if (error) {
                logger.error('Insert query failed \n Error : ' + JSON.stringify(error, undefined, 2))
            }
            else {
                logger.info(JSON.stringify(rows, undefined, 2));
            }
        });
    };



    //Callback function for mysql
    this.query = function (query) {
        logger.info("Query : " + query)

        this.mysqlConnection.query(query, (error, rows, fields) => {
            if (error) {
                logger.error('Insert query failed \n Error : ' + JSON.stringify(error, undefined, 2))
            }
            else {
                logger.info(JSON.stringify(rows, undefined, 2));
            }
        });
    };
}

module.exports = DBUtil;
