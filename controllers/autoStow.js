import path from "path";
import { fileURLToPath } from "url";
import { logic } from "../logic/refinedSA.js";
import { defaultData } from "./defaultData.js";
import { defaultCont } from "./defaultCont.js";
import fs from "fs";

export const autoStow = (req, res) => {
   res.send("hi bro");
};

export const upload = (req, res) => {
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = path.join(path.dirname(__filename), "..");

   if (req.files === null) {
      return res.status(400).json({ msg: "No File to Upload" });
   }

   const file = req.files.file;
   const fileName = Math.floor(Date.now() / 1000) + "_" + file.name;

   file.mv(`${__dirname}/logic/Raw_Input/${fileName}`, (err) => {
      if (err) {
         console.log(err);
         return res.status(200).json({ msg: "server error" });
      }
      res.json({ msg: "File Uploaded Successfully", fileName: fileName });
   });
};

export const result = (req, res) => {
   // res.status(200).json({ devi, finalResult });
   res.status(200).json({ msg: "Algorithm started" });
   const [devi, finalResult] = logic(req.body.fileName, req.body.score);
};

export const resultFileNameIndicator = (req, res) => {
   res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
   res.header("Expires", "-1");
   res.header("Pragma", "no-cache");

   res.setHeader("Content-Type", "text/event-stream");
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = path.join(path.dirname(__filename), "../");
   // const fileName = req.params.fileName;

   const dataToSend = JSON.stringify(
      JSON.parse(fs.readFileSync(`${__dirname}/logic/indicator/indicator.json`, "utf8"))
   );

   const intervalID = setInterval(() => {
      res.write("data: " + `${dataToSend}\n\n`);
   }, 3 * 1000);
   res.on("close", () => {
      console.log("client closed connection");
      clearInterval(intervalID);
      res.end();
   });
};

export const resultFileName = (req, res) => {
   res.setHeader("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   const file = req.params.fileName;

   try {
      const finalData = JSON.parse(fs.readFileSync(`./logic/Result/${file}.json`, "utf8"));
      res.status(200).json({ devi: finalData.devi, finalResult: finalData.result });
   } catch (error) {
      console.log(error);
   }
};

export const UpdateIndicator = (req, res) => {
   const fileName = req.body.fileName;

   const __filename = fileURLToPath(import.meta.url);
   const __dirname = path.join(path.dirname(__filename), "../");

   try {
      const fileRead = JSON.parse(fs.readFileSync(`${__dirname}/logic/indicator/indicator.json`, "utf8"));
      fileRead[`${fileName}`] = "not ready";
      const fileWrite = JSON.stringify(fileRead);
      fs.writeFileSync(`${__dirname}/logic/indicator/indicator.json`, fileWrite, "utf8");
   } catch (error) {
      res.status(500).json({ msg: "Update Failed" });
   }
   res.status(200).json({ msg: "Update Done" });
};
