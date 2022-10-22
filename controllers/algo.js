import { workerData, parentPort } from "worker_threads";
import { logic } from "../logic/refinedSA.js";

console.log(workerData);

const fileName = workerData.fileName;
const score = workerData.score;
const dif = workerData.dif;

logic(fileName, score, dif);

// parentPort.postMessage(result);
