import { createRequire } from "module";
const require = createRequire(import.meta.url);

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.join(path.dirname(__filename), "..");
const __dirname = path.dirname(__filename);

const excelToJson = require("convert-excel-to-json");

function etj(fileName) {
   const result = excelToJson({
      sourceFile: `${__dirname}/${fileName}`,

      sheets: [
         {
            name: "Sheet1",
            header: { rows: 1 },
            columnToKey: {
               A: "Slot",
               B: "Weight",
               C: "Bay",
            },
         },
         {
            name: "Sheet2",
            header: { rows: 1 },
            columnToKey: {
               A: "ContainerNumber",
               B: "Position",
               C: "Weight",
            },
         },
      ],
   });
   return [result["Sheet1"], result["Sheet2"]];
}

export { etj };
