// NOTE a file full of various helper functions

//<editor-fold desc="Drawing">

function drawPiece(imgSrc, row, col, extraClasses = []) {

    // get the square based on pos
    let pieceSquare = getSquareByRowCol(row, col);

    // create the piece image
    let img = $(document.createElement('img'));
    img.attr('src', imgSrc);
    img.attr('class', 'piece');
    img.attr('onclick', 'selectPiece(this, event);');

    // add any extra classes
    if(extraClasses !== []) {
        extraClasses.forEach(function(cssClass) {
            img.attr('class', img.attr('class') + " " + cssClass + " ");
        });
    }

    // place the piece
    pieceSquare.append(img);
    pieceSquare.attr('data-occupied', 'true');

}

function removePiece(row, col) {

    let square = getSquareByRowCol(row, col);

    square.children('.piece').remove();
    square.attr('data-occupied', 'false');

}

function drawLegalMoveOverlayImage(row, col) {

    let img = $(document.createElement('img'));
    img.attr('src', 'img/legal_move_overlay.PNG');
    img.attr('class', 'legal_move_overlay');
    img.attr('data-row', row);
    img.attr('data-col', col);
    img.hide(); // hiding them initially because no move is selected

    let square = getSquareByRowCol(row, col);
    square.append(img);

}

//</editor-fold>

// returns true if pos is in posArr
// false otherwise
// expects pos to be an array: [row, col]
// expects posArr to be an array of arrays: [ [row1, col1], [row2, col2], ... ]
function isPosInArray(pos, posArr) {
    let inArray = false;
    posArr.forEach(function(rowColArr) {
        if(+rowColArr[0] === +pos[0] && +rowColArr[1] === +pos[1]) {
            inArray = true;
        }
    });
    return inArray;
}

// returns four (or less if a square is on the side or corner) squares that are adjacent to the square at row, col
// adjacent means above, below, to the left, or to the right
function getAdjSquares(row, col) {

    // the possible adjacent squares
    // this may over count depending on if these values go out of range of the board
    let adjacentSquares = [
        [+row - 1, +col], // above
        [+row + 1, +col], // below
        [+row, +col + 1], // right
        [+row, +col - 1]  // left
    ];

    // do some checking to get the legal squares
    let legalAdjacentSquares = [];
    adjacentSquares.forEach(function(rowColArr) {
        if( // if the row and column are in the bounds of the board
            !(rowColArr[0] < 0 || rowColArr[0] >= rows || rowColArr[1] < 0 || rowColArr[1] >= cols)
        ) {
            legalAdjacentSquares.push(rowColArr);
        }
    });

    return legalAdjacentSquares;

}

// this function returns an array of positions without the corner positions in it
// expects posArr to be an array of arrays: [ [row1, col1], [row2, col2], ... ]
function filterOutCornerSquares(posArr) {

    let corners = [
        [0,        0       ], // top left
        [0,        cols - 1], // top right
        [rows - 1, cols - 1], // bottom right
        [rows - 1, 0       ]  // bottom left
    ];

    let filteredArray = [];
    posArr.forEach(function(rowColArr) {
        // if the value from the input array is not a corner, push it to the new array
        if(!isPosInArray(rowColArr, corners)) {
            filteredArray.push(rowColArr);
        }
    });

    return filteredArray;

}

// returns true if type1 and type 2 are enemies, false otherwise
// type1 and type2 are -1, 0, or 1 corresponding to the piece types given by the pieceType function
function areEnemies(type1, type2) {

    // if type1 is king side and type2 is attacker
    if((type1 === 1 || type1 === 0) && type2 === -1) {
        return true;
    }

    // if type2 is king side and type1 is attacker
    if((type2 === 1 || type2 === 0) && type1 === -1) {
        return true;
    }

    return false;

}

// returns -2, -1, 0, or 1 based on the pieceType function
function getSquareType(row, col) {
    let square = getSquareByRowCol(row, col);
    let pieceSrc = square.children('.piece').attr('src');
    return pieceType(pieceSrc);
}

// returns 1 for King, 0 for King Pawn, and -1 for Attacker Pawn based on img src
// returns -2 for an empty space or a non-existent space
// img src corresponds to the name of the file in the img folder
function pieceType(imgSrc) {

    switch(imgSrc) {
        case "img/attacker_pawn.PNG":
            return -1;
        case "img/king_pawn.PNG":
            return 0;
        case "img/king.PNG":
            return 1;
        default:
            return -2;
    }

}

// returns true if king is at pos
// false otherwise
function isKing(row, col) {
    return (getSquareType(row, col) === 1);
}

// since whoseTurn is -1 for attackers and 1 for king side, we can just check to see if
// the selected piece and the whoseTurn variables are enemies (see pieceType() function)
// if they are, you can't move
// else you can move
function correctTurn() {
    return !(areEnemies(whoseTurn, getSquareType(whichPiece.row, whichPiece.col)));
}

// similar to correctTurn()
function canSelectPiece(pieceType) {
    return !(areEnemies(whoseTurn, pieceType));
}

// returns the td with data-pos value equal to pos
function getSquareByRowCol(row, col) {
    return $('td[data-row=' + row + '][data-col=' + col + ']');
}

// true if the square is occupied by ANY piece
// false otherwise
function isSquareOccupied(row, col) {
    let square = getSquareByRowCol(row, col);
    return (square.attr('data-occupied') === "true");
}

// true if the square is occupied by an attacker
// false otherwise
function isSquareAttacker(row, col) {
    if(isSquareOccupied(row, col)) {
        return (getSquareType(row, col) === -1); // attackers are represented by -1
    }
    return false;
}

// true if (row, col) is a corner square
// false otherwise
function isCornerSquare(row, col) {
    // if it's the first row
    if(+row === 0) {
        return (+col === 0 || +col === (cols - 1));
    }
    // if it's the last row
    if(+row === (rows - 1)) {
        return (+col === 0 || +col === (cols - 1));
    }
    return false;
}

// posArr is an array of data-row and data-col values i.e. [[row1, col1], [row2, col2], ...]
// returns true if all positions in the array are occupied by attackers
// false if even one of them is not
function areSquaresAllAttackers(posArr) {
    let squaresAllAttackers = true;
    posArr.forEach(function(rowColArr) {
        if(!isSquareAttacker(rowColArr[0], rowColArr[1])) squaresAllAttackers = false;
    });
    return squaresAllAttackers;
}

// get a jQuery array of td elements
function getAllBoardSquares() {
    return $("#" + gameBoardId).find("td");
}
