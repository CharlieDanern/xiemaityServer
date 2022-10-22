import { createRequire } from "module";
const require = createRequire(import.meta.url);

import { etj } from "./Raw_Input/excelToJson.js";

let WeightClass = {
   1: 7,
   2: 9,
   3: 11,
   4: 15,
   5: 18,
   6: 19,
};

function setWeightClass(newWC) {
   WeightClass = newWC;
}

let uniqueWeightClass = Object.keys(WeightClass);
for (var i = 0; i < uniqueWeightClass.length; i++) {
   uniqueWeightClass[i] = parseInt(uniqueWeightClass[i]);
}

function setWCForProjections(_Projections) {
   for (var i = 0; i < _Projections.length; i++) {
      for (var j = uniqueWeightClass.length - 1; j > 0; j--) {
         if (_Projections[i].Weight <= WeightClass[j]) {
            _Projections[i]["Class"] = j;
         }
      }
      if (_Projections[i].Weight >= WeightClass[uniqueWeightClass.length]) {
         _Projections[i]["Class"] = uniqueWeightClass.length;
      }
   }
   return _Projections;
}

function setWCForyardInput(_yardInput) {
   _yardInput = combineLastTwoRows(_yardInput);
   for (var i = 0; i < _yardInput.length; i++) {
      for (var j = uniqueWeightClass.length - 1; j > 0; j--) {
         if (_yardInput[i].Weight <= WeightClass[j]) {
            _yardInput[i]["Class"] = j;
         }
      }
      if (_yardInput[i].Weight >= WeightClass[uniqueWeightClass.length]) {
         _yardInput[i]["Class"] = uniqueWeightClass.length;
      }
   }

   return _yardInput;
}

function combineLastTwoRows(_yardInput) {
   let uniqueBlock = [];
   let uniqueRow = [];

   for (var i = 0; i < _yardInput.length; i++) {
      uniqueBlock.push(_yardInput[i].Position.slice(0, 4));
      uniqueRow.push(_yardInput[i].Position.slice(0, 5));
   }
   uniqueBlock = [...new Set(uniqueBlock)].sort();
   uniqueRow = [...new Set(uniqueRow)].sort();

   /** you can always take the first row freely without chimney concerns regardless of it's A or not
    * 1 row: nothing
    * 2 rows: combine into 1
    * 3 rows: 1 + 2
    * 4 rows: 2 + 2
    * 5 rows: 1 + 2 + 2
    * 6 rows: 1 + 3 + 2
    * 7 rows: 1 + 2 + 2 + 2
    * according to this system, we will have 4 types of Rows:
    *    + 1st row
    *    + X : Top, always 2
    *    + Y : Middle, 3 for 6 rows, 2 for remaining
    *    + Z : Bottom, always 2
    */

   let category = {};

   for (var i = 0; i < uniqueBlock.length; i++) {
      let tem = [];
      for (var j = 0; j < uniqueRow.length; j++) {
         if (uniqueRow[j].slice(0, 4) === uniqueBlock[i]) {
            tem.push(uniqueRow[j]);
         }
      }
      tem.sort();

      if (tem.length == 7) {
         category[tem[1]] = category[tem[2]] = "X";
         category[tem[3]] = category[tem[4]] = "Y";
         category[tem[5]] = category[tem[6]] = "Z";
      } else if (tem.length == 6) {
         category[tem[1]] = category[tem[2]] = category[tem[3]] = "Y";
         category[tem[4]] = category[tem[5]] = "Z";
      } else if (tem.length == 5) {
         category[tem[1]] = category[tem[2]] = "Y";
         category[tem[3]] = category[tem[4]] = "Z";
      } else if (tem.length == 4) {
         category[tem[0]] = category[tem[1]] = "Y";
         category[tem[2]] = category[tem[3]] = "Z";
      } else if (tem.length == 3) {
         category[tem[1]] = category[tem[2]] = "Z";
      } else if (tem.length == 2) {
         category[tem[0]] = category[tem[1]] = "Z";
      }
   }

   for (var i = 0; i < _yardInput.length; i++) {
      let replacedLetter =
         category[_yardInput[i].Position.slice(0, 5)] !== undefined
            ? category[_yardInput[i].Position.slice(0, 5)]
            : _yardInput[i].Position.slice(4, 5);
      _yardInput[i].Position = _yardInput[i].Position.slice(0, 4).concat(replacedLetter);
   }
   // console.log(_yardInput);
   return _yardInput;
}

function analyzeBay(Projections) {
   function _analyzeBay(bay) {
      let bayInfo = [];

      for (var n = 0; n < uniqueWeightClass.length; n++) {
         let count = 0;
         for (var m = 0; m < Projections.length; m++) {
            if (Projections[m].Bay.slice(0, 2) == bay && uniqueWeightClass[n] == Projections[m].Class) {
               count++;
            }
         }
         bayInfo.push(count);
      }
      bayInfo[uniqueWeightClass.length] = bay;
      // bayObject = [bay, bayInfo];

      return bayInfo;
   }

   let allBays = [];
   let allDecks = [];

   for (i in Projections) {
      allBays.push(Projections[i].Bay.slice(0, 2));
      allDecks.push(Projections[i].Bay);
   }

   let uniqueBay = [...new Set(allBays)].sort();
   let uinqueDeck = [...new Set(allDecks)];

   let bayWithWC = [];
   for (var j = 0; j < uniqueBay.length; j++) {
      bayWithWC.push(_analyzeBay(uniqueBay[j]));
   }

   return [uniqueBay, bayWithWC];
}

function analyzeCY(yardInput) {
   const block = 4;
   const row = 5;
   function _analyzeCY(CY) {
      let CYInfo = [];
      let CYObject = {};

      for (var n = 0; n < uniqueWeightClass.length; n++) {
         let count = 0;
         for (var m = 0; m < yardInput.length; m++) {
            if (yardInput[m].Position.slice(0, row) == CY && uniqueWeightClass[n] == yardInput[m].Class) {
               count++;
            }
         }
         CYInfo.push(count);
      }
      CYInfo[uniqueWeightClass.length] = CY.slice(0, 1) == 1 || CY.slice(0, 1) == 2 ? 0 : 1;
      CYObject["ID"] = CY;
      CYObject["Value"] = CYInfo;

      return CYObject;
   }
   let allCY = [];
   for (var i = 0; i < yardInput.length; i++) {
      allCY.push(yardInput[i].Position.slice(0, row));
   }

   let uniqueCY = [...new Set(allCY)].sort();

   let CYWithWC = [];

   for (var j = 0; j < uniqueCY.length; j++) {
      CYWithWC.push(_analyzeCY(uniqueCY[j]));
   }

   return [uniqueCY, CYWithWC];
}

function preHandle(fileName) {
   const _Projections = etj(fileName)[0];
   const _yardInput = etj(fileName)[1];

   const Projections = setWCForProjections(_Projections);
   const yardInput = setWCForyardInput(_yardInput);

   const [uniqueBay, bayWithWC] = analyzeBay(Projections);
   const [uniqueCY, CYWithWC] = analyzeCY(yardInput);

   return [uniqueWeightClass, Projections, yardInput, uniqueBay, bayWithWC, uniqueCY, CYWithWC];
}

// preHandle("input.xlsx");

export { preHandle };
