require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const express = require("express");
const cors = require("cors");

const { equal } = require("assert");
const { load, RetType, ParamsType } = require("ffi-rs");

var edge = require("edge-js");

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

// const r = load({
//   library: "C:\\work\\server.gl\\src\\services\\MaintainOperationsClass\\clsMaintainWorkCtr.dll",
//   funcName: "SetWorkCenterStatus",
//   retType: RetType.Void,
//   paramsType: [],
//   paramsValue: [],
// });

// var clrMethod = edge.func({
//   assemblyFile: 'C:\\work\\server.gl\\src\\services\\MaintainOperationsClass\\clsMaintainWorkCtr.dll',
//   typeName: 'Main',
//   methodName: 'SetWorkCenterStatus' // This must be Func<object,Task<object>>
// });

// console.log(clrMethod);
// console.log(r);


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
