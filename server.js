import express from "express";
import dotevn from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import timeout from "connect-timeout";

import autoStow from "./routes/autoStow.js";

dotevn.config();
const app = express();
app.use(cors());

app.use(timeout(10 * 60 * 1000));

app.use(fileUpload());
app.use(bodyParser.json({ limit: "30mb", extended: "true" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: "true" }));
app.use(haltOnTimedout);

app.use("/autostow", autoStow);

// Add Access Control Allow Origin headers
// app.use((req, res, next) => {
//    res.setHeader("Access-Control-Allow-Origin", "*");
//    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//    next();
// });

function haltOnTimedout(req, res, next) {
   if (!req.timedout) next();
}

const port = process.env.PORT || 4000;

app.listen(port, () => {
   console.log(`Server started on Port ${port}`);
});
