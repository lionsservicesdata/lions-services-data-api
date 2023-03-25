
//Initializations
const natalie_sql = 'seniordesigndata.database.windows.net'
var server = ''
server = natalie_sql

const bodyParser = require('body-parser')
const express = require('express');
const app = express();
const sql = require('mssql');
const cors = require('cors');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())

const config = {
  user: 'CloudSA2d97a179', // sql user
  password: '8w0Zq@^*^8C!', //sql user password
  server: server,
  database: 'Webapp',
  options: {
    trustedconnection: true,
    enableArithAbort: true,
  },
  trustServerCertificate: true,
  port: 1433
}

//Helper Functions

async function getTable(tableName) {
  try {
    let pool = await sql.connect(config);
    let rows = await pool.request().query('SELECT * FROM ' + tableName);
    return rows.recordsets;
  }
  catch (error) {
    console.log(error);
  }
}

async function scanQR(data) {
  console.log(data)
  try {
    let pool = await sql.connect(config);
    let input = await pool.request()
      .query('UPDATE [dbo].[QR] SET scanned = 1, date_scanned = \'' + data.date_scanned + '\' WHERE id =' + data.id)
    return input.recordsets;
  } catch (error) {
    console.log(error)
  }
}

// Post Helper Functions
async function postProduction_System(data) {
  console.log(data)
  try {
    let pool = await sql.connect(config);
    let input = await pool.request()
      .input('production_system_name', sql.NVarChar, data.production_system_name)
      .input('product_name', sql.NVarChar, data.product_name)
      .input('date_created', sql.DateTime, data.date_created)
      .query('INSERT INTO Production_Systems Values (@production_system_name, @product_name, @date_created)')
    return input.recordsets;
  }
  catch (error) {
    console.log(error);
  }
}

async function postLots(data) {
  console.log(data)
  try {
    let pool = await sql.connect(config);
    let input = await pool.request()
    .input('production_system_name', sql.NVarChar, data.production_system_name)
    .input('lot_number', sql.Int, data.lot_number)
    .input('line_number', sql.Int, data.line_number)
    .input('order_ref', sql.Int, data.order_ref)
    .input('order_size', sql.Int, data.order_size)
    .input('date_entered', sql.DateTime, data.date_entered)
    .input('order_date', sql.DateTime, data.order_date)
    .input('lot_date', sql.DateTime, data.lot_date)
    .input('due_date', sql.DateTime, data.due_date)
    .input('customer', sql.NVarChar, data.customer)
    .input('customer_name', sql.NVarChar, data.customer_name)
  .query('INSERT INTO Lots Values (@production_system_name, @lot_number, @line_number, @order_ref, @order_size, @date_entered, @order_date, @lot_date, @due_date, @customer, @customer_name)')
    return input.recordsets;
  }
  catch (error) {
    console.log(error);
  }
}

async function postQR(data) {
  console.log(data)
  try {
    let pool = await sql.connect(config);
    let input = await pool.request()
      .input('id', sql.Int, data.id)
      .input('station_name', sql.NVarChar, data.station_name)
      .input('lot_number', sql.NVarChar, data.lot_number)
      .input('production_system_name', sql.NVarChar, data.production_system_name)
      .input('bundle_size', sql.Int, data.bundle_size)
      .input('scanned', sql.Int, data.scanned)
      .input('date_created', sql.DateTime, data.date_created)
      .input('date_scanned', sql.DateTime, data.date_scanned)
      .input('qr_string', sql.NVarChar, data.qr_string)
    .query('INSERT INTO QR Values (@id, @station_name, @lot_number, @production_system_name, @bundle_size, @scanned, @date_created, @date_scanned, @qr_string)')
    return input.recordsets;
  }
  catch (error) {
    console.log(error);
  }
}

async function postControl_Stations(data) {
  console.log(data)
  try {
    let pool = await sql.connect(config);
    let input = await pool.request()
      .input('station_name', sql.NVarChar, data.station_name)
      .input('production_system_name', sql.NVarChar, data.production_system_name)
      .input('station_type', sql.NVarChar, data.station_type)
      .input('bundle_size', sql.Int, data.bundle_size)
      .input('date_created', sql.DateTime, data.date_created)
    .query('INSERT INTO Control_Stations Values (@station_name, @production_system_name, @station_type, @bundle_size, @date_created)')
    return input.recordsets;
  }
  catch (error) {
    console.log(error);
  }
}


//Misc Post Requests

app.post('/QRSCAN', function (req, res) {
  console.log('QR SCAN RECEIVED')
  let data = { ...req.body }
  scanQR(data)
  res.end();
  console.log('QR SCAN SUCCESSFUL')
});

//Template for POST Request

app.post('/Production_Systems', function (req, res) {
  console.log('NEW PRODUCTION SYSTEM SUCCESSFULY RECEIVED')
  let data = { ...req.body }
  postProduction_System(data)
  res.end();
  console.log('NEW PRODUCTION SYSTEM SUCCESSFULY CREATED')
});

app.post('/QR', function (req, res) {
  console.log('NEW QR SUCCESSFULY RECEIVED')
  let data = { ...req.body }
  postQR(data)
  res.end();
  console.log('NEW QR SUCCESSFULY CREATED')
});

app.post('/Lots', function (req, res) {
  console.log('NEW LOT SUCCESSFULY RECEIVED')
  let data = { ...req.body }
  postLots(data)
  res.end();
  console.log('NEW LOT SUCCESSFULY CREATED')
});

app.post('/Control_Stations', function (req, res) {
  console.log('NEW STATION SUCCESSFULY RECEIVED')
  let data = { ...req.body }
  postControl_Stations(data)
  res.end();
  console.log('NEW STATION SUCCESSFULY CREATED')
});

//API Endpoints

app.get('/QR', (req, res) => {
  console.log('GET Request Received')
  getTable('QR').then((data) => {
    res.send(data[0]);
  })
  console.log('GET Response Sent')
});

app.get('/Production_Systems', (req, res) => {
  console.log('GET Request Received')
  getTable('Production_Systems').then((data) => {
    res.send(data[0]);
  })
  console.log('GET Response Sent')
});

app.get('/Control_Stations', (req, res) => {
  console.log('GET Request Received')
  getTable('Control_Stations').then((data) => {
    res.send(data[0]);
  })
  console.log('GET Response Sent')
});

app.get('/Lots', (req, res) => {
  console.log('GET Request Received')
  getTable('Lots').then((data) => {
    res.send(data[0]);
  })
  console.log('GET Response Sent')
});

//API END\\
app.listen(3001, function () {
  console.log('server is running on port 3001');
})


app.listen(3001, '10.0.0.130')