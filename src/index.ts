require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const express = require("express");
const cors = require("cors");
// const dotnet = require('node-api-dotnet');

const { glDB } = require("./config/database");
const jobRoutes = require("./routes/jobs");
const auth = require("./routes/employee");
const operationRoutes = require("./routes/operation");
const poRoutes = require("./routes/po");
const trackingRoutes = require("./routes/tracking");
const noteRoutes = require("./routes/notes");
const customersRoutes = require("./routes/customer");
const powerBI = require("./routes/powerBI");
const partNumber = require("./routes/partNumber");
var path = require("path");
// var edge = require("edge-js");

// require('./services/MaintainOperationsClass/bin/System.Configuration.ConfigurationManager.js');
// require('./services/MaintainOperationsClass/bin/System.Data.Odbc.js');
// require('./services/MaintainOperationsClass/bin/Microsoft.Win32.SystemEvents.js');
// require('./services/MaintainOperationsClass/bin/System.Collections.Immutable.js');
// require('./services/MaintainOperationsClass/bin/System.Console.js');
// require('./services/MaintainOperationsClass/bin/System.Drawing.Common.js');
// require('./services/MaintainOperationsClass/bin/System.Reflection.Metadata.js');
// require('./services/MaintainOperationsClass/bin/System.Reflection.MetadataLoadContext.js');
// require('./services/MaintainOperationsClass/bin/System.Runtime.CompilerServices.Unsafe.js');
// require('./services/MaintainOperationsClass/bin/System.Runtime.js');
// require('./services/MaintainOperationsClass/bin/System.Security.Cryptography.ProtectedData.js');
// require('./services/MaintainOperationsClass/bin/System.Security.Permissions.js');
// require('./services/MaintainOperationsClass/bin/System.Text.Encoding.CodePages.js');
// require('./services/MaintainOperationsClass/bin/System.Windows.Extensions.js');

// dotnet.load(path.join(__dirname, './services/MaintainOperationsClass/clsMaintainWorkCtr.dll'));

// const exampleObj = dotnet.JBMaintainWC.MaintainWorkCtr;
// const exampleClass = new exampleObj()
// exampleClass.SetPromisedDate(null, null)

// var clrMethod = edge.func({
//   // assemblyFile: 'C:\\work\\server.gl\\src\\services\\MaintainOperationsClass\\clsMaintainWorkCtr.dll',
//   assemblyFile: path.join(__dirname, './services/MaintainOperationsClass/clsMaintainWorkCtr.dll'),
//   // typeName: 'JBMaintainWC',
//   // nameSpace: 'JBMaintainWC',
//   typeName: 'JBMaintainWC.MaintainWorkCtr',
//   methodName: 'SetWorkCenterStatus' // This must be Func<object,Task<object>>
// });

glDB
  .authenticate()
  .then(() => console.log("DB Authenticated"))
  .catch((err: any) => {
    console.log("Error: " + err);
    // console.log(logger.error());
    // logger.error(err.stack);
    // throw err;
  });

const PORT = process.env.PORT;

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(jobRoutes);
app.use(auth);
app.use(operationRoutes);
app.use(poRoutes);
app.use(trackingRoutes);
app.use(noteRoutes);
app.use(customersRoutes);
app.use(powerBI);
app.use(partNumber);

app.listen(PORT, () => {
  console.log(`Sever is up and listening on port ${PORT}`);
  console.log(process.env.DB_NAME, "env");
});
