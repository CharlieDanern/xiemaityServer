import express from "express";
import dotevn from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import fileUpload from "express-fileupload";

import autoStow from "./routes/autoStow.js";

dotevn.config();
const app = express();

app.use(cors());
app.use(fileUpload());

app.use(bodyParser.json({ limit: "30mb", extended: "true" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: "true" }));

app.use("/autostow", autoStow);

const port = process.env.PORT || 4000;

app.listen(port, () => {
   console.log(`Server started on Port ${port}`);
});
