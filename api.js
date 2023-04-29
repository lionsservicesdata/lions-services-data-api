
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

class QR {
  id;
  station_name;
  lot_number;
  production_system_name;
  bundle_size;
  scanned;
  date_created;
  date_scanned;
  qr_string;

  constructor(id, station_name, lot_number, production_system_name, bundle_size, scanned, date_created, date_scanned, qr_string) {
    this.id = id;
    this.station_name = station_name;
    this.lot_number = lot_number;
    this.production_system_name = production_system_name;
    this.bundle_size = bundle_size;
    this.scanned = scanned;
    this.date_created = date_created;
    this.date_scanned = date_scanned;
    this.qr_string = qr_string;
  }
}
//==========================================================
//Helper Functions
const getSQLDateTime = () => {
  const date = new Date();
  var datetime = date.getFullYear() + '-'
    + String(Number(date.getMonth()) + Number(1)) + '-'
    + date.getDate() + ' '
    + String(Number(date.getHours()) - Number(4)) + ':'
    + date.getMinutes() + ':'
    + date.getSeconds()
  return datetime
}

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

async function getQRTable() {
  try {
    let pool = await sql.connect(config);
    let rows = await pool.request().query('SELECT * FROM QR ORDER BY id');
    return rows.recordsets;
  }
  catch (error) {
    console.log(error);
  }
}


async function getStationsGivenProductionSystems(production_system_name) {
  try {
    let pool = await sql.connect(config);
    let rows = await pool.request().query("SELECT * FROM Control_Stations WHERE production_system_name = " + "'" + production_system_name + "'" + "AND" + " station_type = 'scan'");
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

async function updateLotGenerated(lot_number) {
  console.log(lot_number)
  try {
    let pool = await sql.connect(config);
    let input = await pool.request()
      .query("UPDATE [dbo].[Lots] SET qr_lot_generated = 1 WHERE lot_number = '" + lot_number + "'")
    return input.recordsets;
  } catch (error) {
    console.log(error)
  }
}

async function getMaxID() {
  try {
    let pool = await sql.connect(config);
    let rows = await pool.request().query('SELECT MAX(id) FROM QR');
    return rows.recordsets[0][0]['']
  }
  catch (error) {
    console.log(error);
  }
}

async function getLotFromLotNumber(lot_number) {
  try {
    let pool = await sql.connect(config);
    let rows = await pool.request().query("SELECT * FROM Lots WHERE lot_number = '" + lot_number + "'");
    console.log(rows.recordsets[0][0])
    return rows.recordsets[0][0]
  }
  catch (error) {
    console.log(error);
  }
}

async function Upload_Lots(data) {
  const length = Object.keys(data).length
  for (let i = 0; i < length; i++) {
    data[i].is_printed = 0
    data[i].qr_lot_generated = 0
    postLot(data[i])
  }
  populateQRLots(data)
}

async function populateQRLots(data) {

}

async function createQRLot(lot_number) {
  getLotFromLotNumber(lot_number).then((lot) => {
    getTable("Production_Systems").then((productionSystems) => {
      getStationsGivenProductionSystems(productionSystems[0][0].production_system_name).then((stations) => {
        getMaxID().then((initialMaxId) => {
          station_index = 0
          stations[0].forEach(station => {
            createQRStationLot(station, lot, initialMaxId, station_index)
            station_index = station_index + 1
          })
          updateLotGenerated(lot_number)
        })
      })
    })
  })
}

async function createQRStationLot(station, lot, initialMaxId, station_index) {
  numberOfQRCodes = Math.floor(Number(lot.qty_ordered) / Number(station.bundle_size))
    for (let i = initialMaxId + numberOfQRCodes*station_index + 1; i < initialMaxId + 1 + numberOfQRCodes*(station_index+1); i++) {
      let temp = new QR(
        i,
        station.station_name,
        lot.lot_number,
        station.production_system_name,
        station.bundle_size,
        0,
        getSQLDateTime(),
        '1900-01-01 00:00:00',
        station.production_system_name.concat("-", lot.lot_number, "-", station.station_name, "-",i)
      )
      postQR(temp)
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

async function postLot(data) {
  try {
    let pool = await sql.connect(config);
    //Potentially Iterate over input with data. Data becomes huge array of all of them.
    let input = await pool.request()
      .input('lot_number', sql.NVarChar, String(data.lot_number))
      .input('order_', sql.NVarChar, String(data.order_))
      .input('order_date', sql.NVarChar, String(data.order_date))
      .input('clin', sql.NVarChar, String(data.clin))
      .input('nsn_number', sql.NVarChar, String(data.nsn_number))
      .input('item_number', sql.NVarChar, String(data.item_number))
      .input('item_description', sql.NVarChar, String(data.item_description))
      .input('qty_ordered', sql.NVarChar, String(data.qty_ordered))
      .input('u_m', sql.NVarChar, String(data.u_m))
      .input('due_date', sql.NVarChar, String(data.due_date))
      .input('customer', sql.NVarChar, String(data.customer))
      .input('contract_number', sql.NVarChar, String(data.contract_number))
      .input('date_open', sql.NVarChar, String(data.date_open))
      .input('date_start', sql.NVarChar, String(data.date_start))
      .input('date_closed', sql.NVarChar, String(data.date_closed))
      .input('status_', sql.NVarChar, String(data.status_))
      .input('comments', sql.NVarChar, String(data.comments))
      .input('qr_lot_generated', sql.Int, data.qr_lot_generated)
      .input('is_printed', sql.Int, data.is_printed)
      .input('production_system_name', String(sql.NVarChar, data.production_system_name))
      .query('INSERT INTO Lots Values (@lot_number, @order_, @order_date, @clin, @nsn_number, @item_number, @item_description, @qty_ordered, @u_m, @due_date, @customer, @contract_number, @date_open, @date_start, @date_closed, @status_, @comments, @qr_lot_generated, @is_printed, @production_system_name)')
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
  console.log(data.qr_lot_generated)
  try {
    let pool = await sql.connect(config);
    let input = await pool.request()
      .input('lot_number', sql.NVarChar, String(data.lot_number))
      .input('order_', sql.NVarChar, String(data.order_))
      .input('order_date', sql.NVarChar, String(data.order_date))
      .input('clin', sql.NVarChar, String(data.clin))
      .input('nsn_number', sql.NVarChar, String(data.nsn_number))
      .input('item_number', sql.NVarChar, String(data.item_number))
      .input('item_description', sql.NVarChar, String(data.item_description))
      .input('qty_ordered', sql.NVarChar, String(data.qty_ordered))
      .input('u_m', sql.NVarChar, String(data.u_m))
      .input('due_date', sql.NVarChar, String(data.due_date))
      .input('customer', sql.NVarChar, String(data.customer))
      .input('contract_number', sql.NVarChar, String(data.contract_number))
      .input('date_open', sql.NVarChar, String(data.date_open))
      .input('date_start', sql.NVarChar, String(data.date_start))
      .input('date_closed', sql.NVarChar, String(data.date_closed))
      .input('status_', sql.NVarChar, String(data.status_))
      .input('comments', sql.NVarChar, String(data.comments))
      .input('qr_lot_generated', sql.Int, data.qr_lot_generated)
      .input('is_printed', sql.Int, data.is_printed)
      .input('production_system_name', sql.NVarChar, String(data.production_system_name))
      .query('UPDATE Lots SET lot_number = @lot_number, order_ = @order_ ,order_date = @order_date, clin = @clin, nsn_number = @nsn_number, item_number = @item_number, item_description = @item_description, qty_ordered = @qty_ordered, u_m = @u_m, due_date = @due_date, customer = @customer, contract_number = @contract_number, date_open = @date_open, date_start = @date_start, date_closed = @date_closed, status_ = @status_, comments = @comments, qr_lot_generated = @qr_lot_generated, is_printed = @is_printed, production_system_name = @production_system_name WHERE lot_number = @lot_number')

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

async function deleteProduction_SystemControl_Stations(data) {
  console.log(data)
  try {
    let pool = await sql.connect(config);
    let input = await pool.request()
      .input('station_name', sql.NVarChar, data.station_name)
      .input('production_system_name', sql.NVarChar, data.production_system_name)
      .query('DELETE FROM Control_Stations WHERE production_system_name = @production_system_name')
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
  try {
    console.log('GET Request Received')
    getMaxID().then((data) => {
      res.send(data[0]);
    })
    console.log('GET Response Sent')
  } catch (e) {
    console.log(e)
  }
});

app.post('/Upload_Lots', function (req, res) {
  console.log('LOT SHEET UPLOADED')
  let data = { ...req.body }
  Upload_Lots(data)
  res.end();
  console.log('LOT SHEET UPLOADED')
})

app.post('/Generate_Single_Lot', function (req, res) {
  console.log('MANUAL QR LOT GENERATE REQUEST RECEIVED')
  let data = { ...req.body }
  createQRLot(Number(Object.keys(data)[0]))
  res.end();
  console.log('MANUAL QR LOT GENERATED')
})

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
  postLot(data)
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
  console.log(data)
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
  deleteProduction_SystemControl_Stations(data)
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
  try {
    console.log('GET Request Received')
    getQRTable().then((data) => {
      res.send(data[0]);
    })
    console.log('GET Response Sent')
  } catch (e) {
    console.log(e)
  }
});

app.get('/Production_Systems', (req, res) => {
  try {
    console.log('GET Request Received')
    getTable('Production_Systems').then((data) => {
      res.send(data[0]);
    })
    console.log('GET Response Sent')
  } catch (e) {
    console.log(e)
  }
});

app.get('/Control_Stations', (req, res) => {
  try {
    console.log('GET Request Received')
    getTable('Control_Stations').then((data) => {
      res.send(data[0]);
    })
    console.log('GET Response Sent')
  } catch (e) {
    console.log(e)
  }
});

app.get('/Lots', (req, res) => {
  try {
    console.log('GET Request Received')
    getTable('Lots').then((data) => {
      res.send(data[0]);
    })
    console.log('GET Response Sent')
  } catch (e) {
    console.log(e)
  }
});

//API END\\
app.listen(3001, function () {
  console.log('server is running on port 3001');
})
