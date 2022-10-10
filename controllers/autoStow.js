export const autoStow = (req, res) => {
   res.send("hi bro");
};
import path from "path";
import { fileURLToPath } from "url";

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

import { logic } from "../logic/refinedSA.js";
export const result = (req, res) => {
   const [devi, finalResult] = logic(req.body.fileName, req.body.score);

   res.status(200).json({ devi, finalResult });
};
