
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


//==========================================================
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

async function getMaxID() {
  try {
    let pool = await sql.connect(config);
    let rows = await pool.request().query('SELECT MAX(id) FROM QR');
    return rows.recordsets;
  }
  catch (error) {
    console.log(error);
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
    //Potentially Iterate over input with data. Data becomes huge array of all of them.
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
      .input('is_printed', sql.Int, data.is_printed)
      .query('INSERT INTO Lots Values (@production_system_name, @lot_number, @line_number, @order_ref, @order_size, @date_entered, @order_date, @lot_date, @due_date, @customer, @customer_name, @is_printed)')
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

// POST Update Helper Functions
async function updateProduction_System(data) {
  console.log(data)
  try {
    let pool = await sql.connect(config);
    let input = await pool.request()
      .input('production_system_name', sql.NVarChar, data.production_system_name)
      .input('product_name', sql.NVarChar, data.product_name)
      .input('date_created', sql.DateTime, data.date_created)
      .query('UPDATE Production_Systems SET product_name = @product_name, date_created = @date_created WHERE production_system_name = @production_system_name')
    return input.recordsets;
  }
  catch (error) {
    console.log(error);
  }
}

async function updateLots(data) {
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
      .input('is_printed', sql.Int, data.is_printed)
      .query('UPDATE Lots SET line_number = @line_number, order_ref = @order_ref, order_size = @order_size, date_entered = @date_entered, order_date = @order_date, lot_date = @lot_date, due_date = @due_date, customer = @customer, customer_name = @customer_name, is_printed = @is_printed WHERE production_system_name = @production_system_name AND lot_number = @lot_number')
    return input.recordsets;
  }
  catch (error) {
    console.log(error);
  }
}

async function updateControl_Stations(data) {
  console.log(data)
  try {
    let pool = await sql.connect(config);
    let input = await pool.request()
      .input('station_name', sql.NVarChar, data.station_name)
      .input('production_system_name', sql.NVarChar, data.production_system_name)
      .input('station_type', sql.NVarChar, data.station_type)
      .input('bundle_size', sql.Int, data.bundle_size)
      .input('date_created', sql.DateTime, data.date_created)
      .query('UPDATE Control_Stations SET production_system_name = @production_system_name, station_type =  @station_type, bundle_size = @bundle_size WHERE station_name = @station_name')
    return input.recordsets;
  }
  catch (error) {
    console.log(error);
  }
}

// POST Delete Helper Functions
async function deleteProduction_System(data) {
  console.log(data)
  try {
    let pool = await sql.connect(config);
    let input = await pool.request()
      .input('production_system_name', sql.NVarChar, data.production_system_name)
      .query('DELETE FROM Production_Systems WHERE production_system_name = @production_system_name')
    return input.recordsets;
  }
  catch (error) {
    console.log(error);
  }
}

async function deleteLots(data) {
  console.log(data)
  try {
    let pool = await sql.connect(config);
    let input = await pool.request()
      .input('production_system_name', sql.NVarChar, data.production_system_name)
      .input('lot_number', sql.Int, data.lot_number)
      .query('DELETE FROM Lots WHERE production_system_name = @production_system_name AND lot_number = @lot_number')
    return input.recordsets;
  }
  catch (error) {
    console.log(error);
  }
}

<<<<<<< Updated upstream
=======
async function deleteLots(data) {
  console.log(data)
  try {
    let pool = await sql.connect(config);
    let input = await pool.request()
      .input('production_system_name', sql.NVarChar, data.production_system_name)
      .input('lot_number', sql.Int, data.lot_number)
      .query('DELETE FROM Lots WHERE production_system_name = @production_system_name AND lot_number = @lot_number')
    return input.recordsets;
  }
  catch (error) {
    console.log(error);
  }
}

>>>>>>> Stashed changes
async function deleteQRLot(data) {
  console.log(data)
  try {
    let pool = await sql.connect(config);
    let input = await pool.request()
      .input('production_system_name', sql.NVarChar, data.production_system_name)
      .input('lot_number', sql.Int, data.lot_number)
      .query('DELETE FROM QR WHERE production_system_name = @production_system_name AND lot_number = @lot_number')
    return input.recordsets;
  }
  catch (error) {
    console.log(error);
  }
}

async function deleteControl_Stations(data) {
  console.log(data)
  try {
    let pool = await sql.connect(config);
    let input = await pool.request()
      .input('station_name', sql.NVarChar, data.station_name)
      .input('production_system_name', sql.NVarChar, data.production_system_name)
      .query('DELETE FROM Control_Stations WHERE station_name = @station_name AND production_system_name = @production_system_name')
    return input.recordsets;
  }
  catch (error) {
    console.log(error);
  }
}

//==========================================================
//Misc Requests

app.post('/QRSCAN', function (req, res) {
  console.log('QR SCAN RECEIVED')
  let data = { ...req.body }
  scanQR(data)
  res.end();
  console.log('QR SCAN SUCCESSFUL')
});

app.get('/MaxID', (req, res) => {
  console.log('GET Request Received')
  getMaxID().then((data) => {
    res.send(data[0]);
  })
  console.log('GET Response Sent')
});

//POST Requests for Rows

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

//POST Requests for Updating Rows
app.post('/Update_Production_Systems', function (req, res) {
  console.log('UPDATE PRODUCTION SYSTEM SUCCESSFULY RECEIVED')
  let data = { ...req.body }
  updateProduction_System(data)
  res.end();
  console.log('PRODUCTION SYSTEM SUCCESSFULY UPDATED')
});

app.post('/Update_Lots', function (req, res) {
  console.log('UPDATE LOT SUCCESSFULY RECEIVED')
  let data = { ...req.body }
  updateLots(data)
  res.end();
  console.log('LOT SUCCESSFULY UPDATED')
});

app.post('/Update_Control_Stations', function (req, res) {
  console.log('UPDATE STATION SUCCESSFULY RECEIVED')
  let data = { ...req.body }
  updateControl_Stations(data)
  res.end();
  console.log('STATION SUCCESSFULY UPDATED')
});

//POST Requests for Deleting Rows
app.post('/Delete_Production_Systems', function (req, res) {
  console.log('DELETE PRODUCTION SYSTEM SUCCESSFULY RECEIVED')
  let data = { ...req.body }
  deleteProduction_System(data)
  res.end();
  console.log('PRODUCTION SYSTEM SUCCESSFULY DELETED')
});

app.post('/Delete_Lots', function (req, res) {
  console.log('DELETE LOT SUCCESSFULY RECEIVED')
  let data = { ...req.body }
  deleteLots(data)
  deleteQRLot(data)
  res.end();
  console.log('LOT SUCCESSFULY DELETED')
});

app.post('/Delete_Control_Stations', function (req, res) {
  console.log('DELETE STATION SUCCESSFULY RECEIVED')
  let data = { ...req.body }
  deleteControl_Stations(data)
  res.end();
  console.log('STATION SUCCESSFULY DELETED')
});

//GET Requests for tables

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

//GET Requests for SELECT
app.get('/Production_Systems_List', (req, res) => {
  console.log('GET Request Received')
  getSelectEntries('Production_Systems', 'production_system_name').then((data) => {
    res.send(data[0]);
  })
  console.log('GET Response Sent')
});

app.get('/Control_Stations_List', (req, res) => {
  console.log('GET Request Received')
  getSelectEntries('Control_Stations', 'station_name').then((data) => {
    res.send(data[0]);
  })
  console.log('GET Response Sent')
});

app.get('/Lots_List', (req, res) => {
  console.log('GET Request Received')
  getSelectEntries('Lots', 'lot_number').then((data) => {
    res.send(data[0]);
  })
  console.log('GET Response Sent')
});


//API END\\
app.listen(3001, function () {
  console.log('server is running on port 3001');
})
