require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const express = require("express");
const cors = require("cors");

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
const operationTime = require("./routes/operationTime");
const jobBoss = require("./routes/jobBoss");

// WC
const circuitDepJobs = require("./routes/work-centers/circuitDepartment");
const convertingJobs = require("./routes/work-centers/converting");
const digitalPrintingJobs = require("./routes/work-centers/digitalPrinting");
const fMaterailJobs = require("./routes/work-centers/fMaterail");
const finishingJobs = require("./routes/work-centers/finishing");
const inspectionJobs = require("./routes/work-centers/inspection");
const lamJobs = require("./routes/work-centers/lam");
const obsoleteJobs = require("./routes/work-centers/obsolete");
const roltJobs = require("./routes/work-centers/rolt");
const shippingJobs = require("./routes/work-centers/shipping");
const engineeringJobs = require("./routes/work-centers/engineering");
const printJobs = require("./routes/work-centers/print");

const PORT = process.env.PORT;

glDB
  .authenticate()
  .then(() => console.log("DB Authenticated"))
  .catch((err: any) => {
    console.log("Error: " + err);
    // console.log(logger.error());
    // logger.error(err.stack);
    // throw err;
  });

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
app.use(operationTime);
app.use(jobBoss);

// WC
app.use(circuitDepJobs);
app.use(convertingJobs);
app.use(digitalPrintingJobs);
app.use(fMaterailJobs);
app.use(finishingJobs);
app.use(inspectionJobs);
app.use(lamJobs);
app.use(obsoleteJobs);
app.use(roltJobs);
app.use(shippingJobs);
app.use(engineeringJobs);
app.use(printJobs);

app.listen(PORT, () => {
  console.log(`Sever is up and listening on port ${PORT}`);
  console.log(process.env.DB_NAME, "env");
});
