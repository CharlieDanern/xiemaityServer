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

//shuffle function to basically re-start
function shuffle(array) {
    let currentIndex = array.length;
    let randomIndex;

    while (currentIndex != 0) {
        //pick random
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        //swap
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
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
    return tempArray.indexOf(Math.max(...Array));
}

// find smallest element and its position within an array
function getSmallest(Array) {
    const tempArray = Array.slice(0, Array.length - 1);
    return tempArray.indexOf(Math.min(...Array));
}

export { compareArrays, shuffle, sumMultipleArray, arraySum, getLargest, getSmallest };
