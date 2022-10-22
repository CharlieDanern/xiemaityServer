// function to compare arrays
function compareArrays(candidate, target) {
   //function to compare 2 arrays of integers
   let pos = -1;
   for (var i = 0; i < target.length; i++) {
      let points = 0;
      for (var j = 0; j < candidate.length; j++) {
         if (candidate[j] == target[i][j]) {
            points += 1;
         }
      }
      if (points == candidate.length) {
         pos = i;
         break;
      }
   }
   return pos;
}

// function to compare arrays with same key
function compare(candidate, target) {
   let tempArary = [];
   target.map((e) => {
      tempArary.push(e.ID);
   });
   return tempArary.indexOf(candidate.ID);
}

//shuffle function to basically re-start
function shuffle(array) {
   let currentIndex = array.length;
   let randomIndex;

   while (currentIndex != 0) {
      //pick random
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      //swap
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
   }

   return array;
}

// sum across multiple arrays (same element position)
function sumMultipleArray(Array, pos) {
   let result = 0;

   for (var i = 0; i < Array.length; i++) {
      result += Array[i][pos];
   }

   return result;
}

//sum a collection of array
function sumAll(array) {
   let result = [];
   for (var i = 0; i < array[0].length; i++) {
      let miniSum = 0;
      for (var j = 0; j < array.length; j++) {
         miniSum += array[j][i];
      }
      result.push(miniSum);
   }
   return result;
}

//minus 2 arrays, return a new array with condition
function minusArrays(array0, array1, lastLength) {
   let result = [];
   for (var i = 0; i < array0.length; i++) {
      i < array0.length - 1 ? result.push(array0[i] - array1[i]) : result.push(array0[i] - array1[i] * lastLength);
   }
   return result;
}

// sum array
function arraySum(Array) {
   const tempArray = Array.slice(0, Array.length - 1);
   return tempArray.reduce((a, b) => {
      return a + b;
   });
}

// find largest element and its position within an array
function getLargest(Array) {
   const tempArray = Array.slice(0, Array.length - 1);
   const positiveArray = tempArray.filter((e) => e > 0);
   const randomIndex = Math.floor(Math.random() * positiveArray.length + 1);

   return tempArray.indexOf(positiveArray[randomIndex - 1]);
}

// find smallest element and its position within an array
function getSmallest(Array) {
   const tempArray = Array.slice(0, Array.length - 1);
   return tempArray.indexOf(Math.min(...Array));
}

//function to write into files.

export { compareArrays, shuffle, sumMultipleArray, arraySum, getLargest, getSmallest, sumAll, minusArrays, compare };
