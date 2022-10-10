import util from "util";
import { preHandle } from "./preHandle.js";
import { compareArrays, shuffle, sumMultipleArray, arraySum, getLargest, getSmallest } from "./utils.js";

// ***********************************  MAIN FUNCTION   *********************************** //
function logic(fileName, score) {
   const [uniqueWeightClass, Projections, yardInput, uniqueBay, targetBay, uniqueCY, targetCY] = preHandle(fileName);
   const bayLength = targetBay.length;
   const CYLength = targetCY.length;

   // let [uniqueBay, targetBay] = analyzeBay();
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

   // let [uniqueCY, targetCY] = analyzeCY();

   function Initialize() {
      let Sample = [];
      const breakpoint = Math.round(CYLength / bayLength);

      for (var i = 0; i < bayLength - 1; i++) {
         Sample[i] = targetCY.slice(i * breakpoint, (i + 1) * breakpoint);
      }
      Sample[bayLength - 1] = targetCY.slice(-(CYLength - (bayLength - 1) * breakpoint));

      return Sample;
   }

   //console.log(util.inspect(Initialize(), false, 3, true));

   // function to calculate deviation, this should return the whole deviation i/o partial deviation
   function _deviation(Sam) {
      let Deviation = new Array(bayLength);
      for (var i = 0; i < Deviation.length; i++) {
         Deviation[i] = new Array(uniqueWeightClass.length + 1);
      }
      for (var i = 0; i <= uniqueWeightClass.length; i++) {
         for (var j = 0; j < bayLength; j++) {
            if (i < uniqueWeightClass.length) {
               Deviation[j][i] = sumMultipleArray(Sam[j], i) - targetBay[j][i];
            } else {
               Deviation[j][i] = sumMultipleArray(Sam[j], i) - targetBay[j][i] * Sam[j].length;
            }
         }
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

   function SpliceGiver(_Sam, _Deviation) {
      let Deviation = _Deviation;
      let Sam = _Sam;
      const Giver = Giver_Receiver(Deviation)[0];

      let largest = [];
      let finalCandidatesPool = [];
      for (var i = 0; i < Giver.length; i++) {
         let pos = Giver[i];
         largest.push(getLargest(Deviation[pos]));
      }

      for (var i = 0; i < Giver.length; i++) {
         let pos = Giver[i];
         let elementPos = largest[i];
         shuffle(Sam[pos]);

         let candidatePool = [];

         for (var j = 0; j < Sam[pos].length; j++) {
            if (Math.abs(Deviation[pos][elementPos] - Sam[pos][j][elementPos]) <= Deviation[pos][elementPos]) {
               let candidate = Sam[pos][j];
               candidatePool.push(candidate);
               finalCandidatesPool.push(candidate);

               Deviation[pos][elementPos] -= Sam[pos][j][elementPos];
            }
         }

         for (var l = 0; l < candidatePool.length; l++) {
            let spliceIndex = compareArrays(candidatePool[l], Sam[pos]);
            if (spliceIndex > -1) {
               Sam[pos].splice(spliceIndex, 1);
            }
         }
      }

      return [Sam, finalCandidatesPool];
   }

   function AddToReceiver(Sam, finalCandidatesPool) {
      let Deviation = _deviation(Sam);
      let Receiver = Giver_Receiver(Deviation)[1];
      const standardPoint = 0.4 * (10 / (4 + uniqueWeightClass.length));

      for (var i = 0; i < finalCandidatesPool.length; i++) {
         let maxPoints = -100;
         let l = 0;
         for (var j = 0; j < Receiver.length; j++) {
            let points = 0;
            let pos = Receiver[j];

            // ****************** check here ******************
            if (arraySum(Deviation[pos]) < 0) points += 4;
            // ****************** check here ******************

            // ****************** YARD BLOCK ******************//
            if (finalCandidatesPool[i][uniqueWeightClass.length] == targetBay[pos][uniqueWeightClass.length]) {
               points += 2;
            }

            for (var k = 0; k < uniqueWeightClass.length; k++) {
               if (Math.abs(Deviation[pos][k] + finalCandidatesPool[i][k]) <= Math.abs(Deviation[pos][k])) {
                  if (k == 0 || k == uniqueWeightClass.length - 1) {
                     points += standardPoint * 3;
                  } else {
                     points -= 0;
                  }
               } else {
                  if (k == 0 || k == uniqueWeightClass.length - 1) {
                     points += standardPoint;
                  } else {
                     points -= 0;
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
      const standardPoint = 0.4 * (10 / (4 + uniqueWeightClass.length));

      for (var i = 0; i < targetBay.length; i++) {
         targetBayAmount[i] = arraySum(targetBay[i]);
         totalContainer += targetBayAmount[i];
      }

      let partialCost = [];
      let totalCost = 0;

      for (var i = 0; i < Deviation.length; i++) {
         let elementPoints = 0;
         let sumPoints = arraySum(Deviation[i]) == 0 ? 4 : 0;
         for (var j = 0; j < Deviation[i].length; j++) {
            if (Math.abs(Deviation[i][j]) <= 1) {
               if (j == 0 || j == Deviation[i].length - 2) {
                  elementPoints += 3 * standardPoint;
               } else if (j == Deviation[i].length - 1) {
                  elementPoints += 2;
               } else {
                  elementPoints += standardPoint;
               }
            } else {
               if (j == 0 || j == Deviation[i].length - 2) {
                  elementPoints -= 0; //3 * 0.5 * Math.abs(Deviation[i][j]);
               } else if (j == Deviation[i].length - 1) {
                  elementPoints -= 0;
               } else {
                  elementPoints -= 0; //1 * 0.5 * Math.abs(Deviation[i][j]);
               }
            }
         }
         partialCost[i] = elementPoints + sumPoints;
         totalCost += (partialCost[i] * targetBayAmount[i]) / totalContainer;
      }

      return totalCost;
   }

   function simulatedAnnealing(targetCost) {
      const startTemp = 10 ** 5;
      const endTemp = 0.1;
      const coolingRate = 0.95;

      const maxCost = 10;

      let currentTemp = startTemp;

      let lastSample = Initialize();
      lastSample = shuffle(lastSample);
      let lastCost = Cost(lastSample);

      let bestSample = lastSample;
      let bestCost = lastCost;

      let count = 0;

      while (currentTemp > endTemp) {
         let currentSample = stateChange(lastSample);
         let currentCost = Cost(currentSample);

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

      return [bestSample, bestCost, count];
   }

   function restart(targetScore) {
      let [res1, res2, count] = simulatedAnnealing(targetScore);
      let masterCount = 0;

      let restartTime = 0;
      while (Cost(res1) < targetScore) {
         console.log(restartTime);
         [res1, res2, count] = simulatedAnnealing(targetScore);
         masterCount += count;
         restartTime++;

         if (restartTime > 20000) {
            targetScore -= 0.1;
            //[res1, res2, count] = simulatedAnnealing(targetScore);
            restartTime = 0;
         }
      }
      console.log(`best cost is: ${res2}`);

      const deviaaaa = _deviation(res1);
      let sumDeviation = [];
      for (var i = 0; i < deviaaaa.length; i++) {
         sumDeviation[i] = arraySum(deviaaaa[i]);
      }
      console.log(sumDeviation);

      console.log(`The total loops it took is: ${masterCount}`);
      return res1;
   }

   function tracebackCY(Sam) {
      let Result = {};
      for (var i = 0; i < Sam.length; i++) {
         let bayName = uniqueBay[i];
         let temp = [];
         for (var j = 0; j < Sam[i].length; j++) {
            let position = -1;
            const pos = compareArrays(Sam[i][j], targetCY);
            if (pos != -1) {
               position = pos;
               temp.push(uniqueCY[position]);
               targetCY.splice(position, 1);
               uniqueCY.splice(position, 1);
            }
         }

         Result[bayName] = temp.sort();
      }
      // for (var i = 0; i < Sam.length; i++) {
      //    console.table(Sam[i]);
      // }
      return Result;
   }

   function getYardBlock() {
      let yardBlock = {};

      for (var i = 0; i < uniqueCY.length; i++) {
         let yardComponent = [];
         for (var j = 0; j < yardInput.length; j++) {
            if (yardInput[j].Position.slice(0, 4) == uniqueCY[i]) {
               yardComponent.push(yardInput[j].ContainerNumber);
            }
         }
         yardBlock[uniqueCY[i]] = yardComponent;
      }

      return yardBlock;
   }

   const yardBlock = getYardBlock();

   function traceContainerNumber() {
      let bestSample = restart(score);
      let result = tracebackCY(bestSample);
      let bestDeviation = _deviation(bestSample);

      console.log(bestDeviation);
      console.log(arraySum(bestDeviation[0]));

      for (var i = 0; i < bestDeviation.length; i++) {
         const length = bestDeviation[i].length;
         const _sum = arraySum(bestDeviation[i]);
         bestDeviation[i][length] = _sum;
      }

      function addKeys(array) {
         let result = {};
         for (var i = 0; i < array.length; i++) {
            if (i < uniqueWeightClass.length) {
               result[`WeightClass${i + 1}`] = array[i];
            } else if (i == uniqueWeightClass.length) {
               result["Block"] = array[i];
            } else {
               result["Total"] = array[i];
            }
         }
         return result;
      }

      let _bestDeviation = [];
      for (var i = 0; i < uniqueBay.length; i++) {
         let tempBay = {};
         tempBay["ID"] = uniqueBay[i];
         let tempObj = { ...tempBay, ...addKeys(bestDeviation[i]) };
         _bestDeviation.push(tempObj);
         // _bestDeviation.push({ ID: uniqueBay[i], value: addKeys(bestDeviation[i]) });
         // _bestDeviation[uniqueBay[i]] = bestDeviation[i];
      }
      console.log("the result is:");
      console.log(_bestDeviation);

      let finalResult = {};

      for (var i = 0; i < uniqueBay.length; i++) {
         let component = [];
         for (var j = 0; j < result[uniqueBay[i]].length; j++) {
            component.push(...yardBlock[result[uniqueBay[i]][j]]);
         }
         finalResult[uniqueBay[i]] = component;
      }

      let finaly = [];
      let tempp = Object.keys(finalResult);
      for (var i = 0; i < tempp.length; i++) {
         let temp = {};
         temp["ID"] = tempp[i];
         finaly.push({ ID: tempp[i], Value: finalResult[tempp[i]] });
      }

      console.log(finaly);

      return [_bestDeviation, finaly];
   }

   const startTime = new Date();

   const [devi, result] = traceContainerNumber();

   const endTime = new Date();
   console.log(`the time it took is: ${(endTime - startTime) / 1000} seconds`);

   return [devi, result];
}

export { logic };
