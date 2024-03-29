import fs from "fs";
import { preHandle } from "./preHandle.js";
import {
   compareArrays,
   shuffle,
   sumMultipleArray,
   arraySum,
   getLargest,
   getSmallest,
   sumAll,
   minusArrays,
   compare,
} from "./utils.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.join(path.dirname(__filename), "../");

// ***********************************  MAIN FUNCTION   *********************************** //

/**
 * we can specify whether vessel stowage is 'easy' or 'difficult' by adjusting the point system between
 * point_element & point_sameBlock
 * on a scale of 1-10, rate how 'difficult vessel stowage is
 * 10 : point_element is 4, point_sameBlock is 1
 * 1  : point_elemnt is 1, point_sameBlock is 4
 * */
function logic(fileName, score, difficulty) {
   const [uniqueWeightClass, Projections, yardInput, uniqueBay, targetBay, uniqueCY, targetCY] = preHandle(fileName);
   const bayLength = targetBay.length;
   const CYLength = targetCY.length;

   const dummyValue = new Array(uniqueWeightClass.length + 1);

   for (var i = 0; i < dummyValue.length; i++) {
      dummyValue[i] = 0;
   }

   const halfBay = Math.floor(targetBay.length / 2) + 1;

   for (var i = 0; i < targetBay.length; i++) {
      if (Math.max(...uniqueBay) < 42) {
         targetBay[i][uniqueWeightClass.length] = i <= halfBay ? 0 : 1;
      } else if (Math.min(...uniqueBay) > 42) {
         targetBay[i][uniqueWeightClass.length] = i >= halfBay ? 1 : 0;
      } else {
         targetBay[i][uniqueWeightClass.length] = targetBay[i][uniqueWeightClass.length] <= 42 ? 0 : 1;
      }
   }

   //Point System:
   const point_total = 4;
   const point_distance = 1;
   const point_element = 1 + (3 / 9) * (difficulty - 1);
   const point_sameBlock = 10 - point_total - point_distance - point_element;

   // function to group rows into block
   function groupRow() {
      let uniqueBlock = [];
      uniqueCY.map((e) => {
         uniqueBlock.push(e.slice(0, 4));
      });
      uniqueBlock = [...new Set(uniqueBlock)];

      let result = {};

      for (var i = 0; i < uniqueBlock.length; i++) {
         let count = 0;
         for (var j = 0; j < uniqueCY.length; j++) {
            if (uniqueBlock[i] === uniqueCY[j].slice(0, 4)) {
               count++;
            }
            result[`${uniqueBlock[i]}`] = count;
         }
      }

      return result;
   }

   const RowCount = groupRow();

   function Initialize() {
      let Sample = [];
      const breakpoint = Math.floor(CYLength / bayLength); // vãi cả lz .floor và .round :(

      for (var i = 0; i < bayLength - 1; i++) {
         Sample[i] = targetCY.slice(i * breakpoint, (i + 1) * breakpoint);
      }
      Sample[bayLength - 1] = targetCY.slice(-(CYLength - (bayLength - 1) * breakpoint));

      return Sample;
   }

   // function to calculate deviation, this should return the whole deviation i/o partial deviation
   function _deviation(Sam) {
      let Deviation = [];
      for (var i = 0; i < Sam.length; i++) {
         const newObject = {
            RowCollection: [],
            Value: [],
         };
         Deviation[i] = newObject;
         if (Sam[i].length != 0) {
            for (var j = 0; j < Sam[i].length; j++) {
               newObject.RowCollection.push(Sam[i][j].ID.slice(0, 4));
               newObject.Value.push(Sam[i][j].Value);
            }
         } else {
            newObject.Value.push(dummyValue);
         }
         newObject.Value = minusArrays(sumAll(newObject.Value), targetBay[i], newObject.RowCollection.length);
      }

      return Deviation;
   }

   function Giver_Receiver(_Deviation) {
      let Giver = [];
      let Receiver = [];

      for (var i = 0; i < _Deviation.length; i++) {
         Giver[i] = Receiver[i] = i;
      }

      return [Giver, Receiver];
   }

   function SpliceGiver(Sam, Deviation) {
      const Giver = Giver_Receiver(Deviation)[0];

      let largest = [];
      let finalCandidatesPool = [];

      for (var i = 0; i < Giver.length; i++) {
         let pos = Giver[i];
         largest.push(getLargest(Deviation[pos].Value));
      }

      for (var i = 0; i < Giver.length; i++) {
         let pos = Giver[i];
         let elementPos = largest[i];
         shuffle(Sam[pos]);

         let candidatePool = [];

         for (var j = 0; j < Sam[pos].length; j++) {
            if (
               Math.abs(Deviation[pos].Value[elementPos] - Sam[pos][j].Value[elementPos]) <=
               Deviation[pos].Value[elementPos]
            ) {
               let candidate = Sam[pos][j];
               candidatePool.push(candidate);
               finalCandidatesPool.push(candidate);

               Deviation[pos].Value[elementPos] -= Sam[pos][j].Value[elementPos];
            }
         }

         for (var l = 0; l < candidatePool.length; l++) {
            let spliceIndex = compare(candidatePool[l], Sam[pos]);
            Sam[pos].splice(spliceIndex, 1);
         }
      }

      return [Sam, finalCandidatesPool];
   }

   function AddToReceiver(Sam, finalCandidatesPool) {
      let Deviation = _deviation(Sam);
      let Receiver = Giver_Receiver(Deviation)[1];
      finalCandidatesPool = shuffle(finalCandidatesPool);

      const standardPoint = point_element / (4 + uniqueWeightClass.length);
      const maxDevi = 100;

      for (var i = 0; i < finalCandidatesPool.length; i++) {
         let maxPoints = 0;
         let l = 0;
         for (var j = 0; j < Receiver.length; j++) {
            let points = 0;
            let pos = Receiver[j];

            // ****************** Total ******************//
            if (arraySum(Deviation[pos].Value) < 0) {
               points += point_total;
            }
            // ****************** SameBlock ******************//
            if (Deviation[pos].RowCollection.indexOf(finalCandidatesPool[i].ID.slice(0, 4)) > -1) {
               points += point_sameBlock;
            }

            // ****************** Distance ******************//
            if (finalCandidatesPool[i].Value[uniqueWeightClass.length] === targetBay[pos][uniqueWeightClass.length]) {
               points += point_distance;
            }

            for (var k = 0; k < uniqueWeightClass.length; k++) {
               let ele = Math.abs(Deviation[pos].Value[k] + finalCandidatesPool[i].Value[k]);
               if (ele <= Math.abs(Deviation[pos].Value[k])) {
                  if (k == 0 || k == uniqueWeightClass.length - 1) {
                     points += (3 * standardPoint * (maxDevi - ele)) / maxDevi;
                  } else {
                     points += (standardPoint * (maxDevi - ele)) / maxDevi;
                  }
               }
            }

            if (points > maxPoints) {
               maxPoints = points;
               l = pos;
            }
         }

         Sam[l].splice(0, 0, finalCandidatesPool[i]);

         Deviation = _deviation(Sam);
      }

      return Sam;
   }

   function stateChange(Sam) {
      let Deviation = _deviation(Sam);
      let [newSam, _finalCandidatesPool] = SpliceGiver(Sam, Deviation);

      newSam = AddToReceiver(newSam, _finalCandidatesPool);
      return newSam;
   }

   function Cost(Sam) {
      const Deviation = _deviation(Sam);

      let targetBayAmount = [];
      let totalContainer = 0;
      for (var i = 0; i < targetBay.length; i++) {
         targetBayAmount[i] = arraySum(targetBay[i]);
         totalContainer += targetBayAmount[i];
      }

      const standardPoint = point_element / (4 + uniqueWeightClass.length);
      const maxDevi = 10;

      let partialCost = [];
      let totalCost = 0;

      for (var i = 0; i < Deviation.length; i++) {
         let elementPoints = 0;

         // point_total
         let sumPoints = arraySum(Deviation[i].Value) == 0 ? point_total : 0;

         //point_sameBlock
         let uniqueBlock = [];
         Deviation[i].RowCollection.map((e) => {
            uniqueBlock.push(e.slice(0, 4));
         });
         uniqueBlock = [...new Set(uniqueBlock)];

         let sameBlockPoints = 0;
         for (var j = 0; j < Deviation[i].RowCollection.length; j++) {
            const rowName = Deviation[i].RowCollection[j];
            sameBlockPoints += 1 / RowCount[rowName];
         }
         sameBlockPoints = (point_sameBlock * sameBlockPoints) / uniqueBlock.length;
         // console.log(`Same Block Point is: ${sameBlockPoints}`);

         for (var j = 0; j < Deviation[i].Value.length; j++) {
            let ele = Math.abs(Deviation[i].Value[j]);

            if (ele <= maxDevi) {
               if (j == 0 || j == Deviation[i].Value.length - 2) {
                  elementPoints += (3 * standardPoint * (maxDevi - ele)) / maxDevi;
               } else if (j == Deviation[i].Value.length - 1) {
                  elementPoints += (point_distance * (maxDevi - ele)) / maxDevi;
               } else {
                  elementPoints += (standardPoint * (maxDevi - ele)) / maxDevi;
               }
            } else {
               elementPoints = 0;
            }
         }
         partialCost[i] = elementPoints + sumPoints + sameBlockPoints;
         totalCost += (partialCost[i] * targetBayAmount[i]) / totalContainer;
      }

      return totalCost;
   }

   function simulatedAnnealing(targetCost) {
      const startTemp = 10 ** 20;
      const endTemp = 0.01;
      const coolingRate = 0.999;

      let currentTemp = startTemp;

      let lastSample = Initialize();
      for (var i = 0; i < lastSample.length; i++) {
         lastSample[i] = shuffle(lastSample[i]);
      }
      let lastCost = Cost(lastSample);

      let bestSample = lastSample;
      let bestCost = lastCost;

      let count = 0;

      while (currentTemp > endTemp) {
         let currentSample = stateChange(lastSample);
         let currentCost = Cost(currentSample);

         // console.log(currentCost);

         if (currentCost > lastCost) {
            lastSample = currentSample;
            lastCost = currentCost;
         } else {
            const prob = Math.random();
            if (prob <= Math.exp(-Math.abs(currentCost - lastCost) / currentTemp)) {
               lastSample = currentSample;
               lastCost = currentCost;
            }
         }

         if (currentCost >= targetCost) {
            bestSample = lastSample;
            bestCost = lastCost;
            break;
         } else {
            bestSample = currentSample;
            bestCost = currentCost;
         }

         currentTemp *= coolingRate;
         count++;
      }

      console.log(`total count is: ${count}`);

      return [bestSample, bestCost, count];
   }

   function restart(targetScore) {
      let [bestSample, bestCost, count] = simulatedAnnealing(targetScore);
      let masterCount = 0;

      let restartTime = 0;
      while (Cost(bestSample) < targetScore) {
         [bestSample, bestCost, count] = simulatedAnnealing(targetScore);
         masterCount += count;
         restartTime++;
         console.log(`restartTime is ${restartTime}`);

         if (restartTime > 10) {
            targetScore -= 0.1;
            restartTime = 0;
         }
      }
      console.log(`best cost is: ${bestCost}`);
      console.log(`The total loops it took is: ${masterCount}`);

      return bestSample;
   }

   function traceContainerNumber(Sam) {
      const Deviation = _deviation(Sam);
      let devi = [];

      // uniqueBay
      for (var i = 0; i < uniqueBay.length; i++) {
         let bayName = uniqueBay[i];
         let tem = {};
         tem["ID"] = bayName;
         let miniTotal = 0;

         for (var j = 0; j < Deviation[i].Value.length; j++) {
            if (j < Deviation[i].Value.length - 1) {
               tem[`WeightClass${j + 1}`] = Deviation[i].Value[j];
               miniTotal += Deviation[i].Value[j];
            } else {
               tem["Block"] = Deviation[i].Value[j];
            }
         }
         tem["Total"] = miniTotal;
         devi.push(tem);
      }
      // console.log(devi);

      const ContainerGroup = Grouping();
      let result = [];

      for (var i = 0; i < uniqueBay.length; i++) {
         let bayName = uniqueBay[i];
         let tem = {};
         tem["ID"] = bayName;
         tem["Value"] = [];
         for (var j = 0; j < Sam[i].length; j++) {
            // tem["Value"].push(Sam[i][j].ID);
            const candidate = ContainerGroup[Sam[i][j].ID];
            tem["Value"].push(...candidate);
         }
         result.push(tem);
      }

      return [devi, result];
   }

   // function to group containers based on Yard Row
   function Grouping() {
      let tem = {};
      for (var i = 0; i < uniqueCY.length; i++) {
         tem[`${uniqueCY[i]}`] = [];
         for (var j = 0; j < yardInput.length; j++) {
            if (yardInput[j].Position.slice(0, 5) === uniqueCY[i]) {
               tem[`${uniqueCY[i]}`].push(yardInput[j].ContainerNumber);
            }
         }
      }

      return tem;
   }

   const startTime = new Date();

   const bestSample = restart(score);
   const [devi, result] = traceContainerNumber(bestSample);
   console.table(devi);

   const endTime = new Date();
   console.log(`the time it took is: ${(endTime - startTime) / 1000} seconds`);

   const deviResult = JSON.stringify({ devi, result });
   try {
      fs.writeFileSync(`${__dirname}/logic/Result/${fileName}.json`, deviResult, "utf-8");
      const fileRead = JSON.parse(fs.readFileSync(`${__dirname}/logic/indicator/indicator.json`, "utf8"));
      fileRead[`${fileName}`] = "ready";
      const fileWrite = JSON.stringify(fileRead);
      fs.writeFileSync(`${__dirname}/logic/indicator/indicator.json`, fileWrite, "utf8");
   } catch (error) {
      console.log(error);
   }

   console.log(point_element);
   console.log(point_sameBlock);

   return [devi, result];
}

export { logic };
