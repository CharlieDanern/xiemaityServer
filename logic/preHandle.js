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

// const Projections = setWCForProjections();
// const yardInput = setWCForyardInput();

function analyzeBay(Projections) {
   function _analyzeBay(bay) {
      let bayInfo = [];

      for (var n = 0; n < uniqueWeightClass.length; n++) {
         let count = 0;
         for (var m = 0; m < Projections.length; m++) {
            if (Projections[m].Bay.slice(0, 2) === bay && uniqueWeightClass[n] === Projections[m].Class) {
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
   let uniqueBay = [...new Set(allBays)].sort((a, b) => {
      return a - b;
   });
   let uinqueDeck = [...new Set(allDecks)];

   let bayWithWC = [];
   for (var j = 0; j < uniqueBay.length; j++) {
      bayWithWC.push(_analyzeBay(uniqueBay[j]));
   }

   return [uniqueBay, bayWithWC];
}

function analyzeCY(yardInput) {
   function _analyzeCY(CY) {
      let CYInfo = [];
      let CYObject = new Array(2);

      for (var n = 0; n < uniqueWeightClass.length; n++) {
         let count = 0;
         for (var m = 0; m < yardInput.length; m++) {
            if (yardInput[m].Position.slice(0, 4) === CY && uniqueWeightClass[n] === yardInput[m].Class) {
               count++;
            }
         }
         CYInfo.push(count);
      }
      CYInfo[uniqueWeightClass.length] = CY.slice(0, 1) == 1 || CY.slice(0, 1) == 2 ? 0 : 1;
      CYObject = [CY, CYInfo];

      return CYInfo;
   }
   let allCY = [];
   for (var i = 0; i < yardInput.length; i++) {
      allCY.push(yardInput[i].Position.slice(0, 4));
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
   //console.log(yardInput);

   const [uniqueBay, bayWithWC] = analyzeBay(Projections);
   const [uniqueCY, CYWithWC] = analyzeCY(yardInput);

   return [uniqueWeightClass, Projections, yardInput, uniqueBay, bayWithWC, uniqueCY, CYWithWC];
}
//preHandle("1665073297_input");

export { preHandle };
