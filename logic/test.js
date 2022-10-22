import { logic } from "./refinedSA.js";
import fs from "fs";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.join(path.dirname(__filename), "../");

logic("input.xlsx", 7, 5);

// const finalData = fs.readFileSync(`${__dirname}/logic/indicator/indicator.json`, "utf8");
// console.log(finalData);
