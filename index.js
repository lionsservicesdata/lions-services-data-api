const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const sql = require('mssql');

const  config = {
    user:  'user', // sql user
    password:  '7U6^060JeHsk', //sql user password
    server:  '127.0.0.1',
    database:  'Production',
    options: {
      trustedconnection:  true,
      enableArithAbort:  true,
    },
    trustServerCertificate: true,
    port:  1433
  }

  //GET Functions for SQL Database
async  function  getTable(tableName) {
    try {
      let  pool = await  sql.connect(config);
      let  products = await  pool.request().query('SELECT * from '+tableName);
      return  products.recordsets;
    }
    catch (error) {
      console.log(error);
    }
  }
  
//GET Requests
app.get('/QR', (req, res) => {
    console.log('GET Request Received')
    getTable('QR').then((data) => {
      res.send(data[0]);
    })
    console.log('GET Response Sent')
  });

//API END\\
app.listen(3000, () => {
console.log('Server started on port 3000...');
});