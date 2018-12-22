let isPieceSelected = false;
let whichPiece = -1; // the position of the piece selected

function selectPiece(piece, event) {

    // so the global board onclick doesn't fire
    event.stopPropagation();

    // remove the class from the previous square
    $('td[data-pos=' + whichPiece + ']').removeClass('selected_square');

    let square = $(piece).parent('td');

    isPieceSelected = true;
    whichPiece = square.attr('data-pos');

    // add the class to the new square
    $('td[data-pos=' + whichPiece + ']').addClass('selected_square');

}

// this function will never trigger when a piece is clicked so there's no need to check if the destination has a piece already on it
function movePiece(event) {

    // if there's nothing selected, we can't do anything
    if(!isPieceSelected) {
        return;
    }

    let destinationSquare = $(event.srcElement);

    // get the destination data-pos to check if move is legal
    let destination = $(destinationSquare).attr('data-pos');

    // if it's not legal, tell the user and return
    if(!isMoveLegal(destination)) {
        alert('illegal move!');
        return;
    }

    // by now, the move is legal and we'll move the piece
    // first, we remove the old piece
    // then we build a new piece and place it in the new position
    let selectedSquare = getSquareByPos(whichPiece);
    let pieceSrc = selectedSquare.children('.piece').attr('src');

    removePiece(whichPiece);

    drawPiece(pieceSrc, destination);

    // see if any pieces were captured
    capturePieces(destination);

}

// try to capture any pieces based on the last move that was made
function capturePieces(lastMove) {

    let squareType = getSquareType(lastMove);

    // plus in front of lastMove is to cast it as int
    let neighbors = [
        +lastMove - 1, // left
        +lastMove + 1, // right
        +lastMove - 11, // top
        +lastMove + 11 // bottom
    ];

    // get the enemy neighbors by checking if the adjacent squares are occupied and if they're enemies
    let enemyNeighbors = [];
    let neighborSquareType;
    neighbors.forEach(function (pos) {

        if(isSquareOccupied(pos)) {

            neighborSquareType = getSquareType(pos);

            if(areEnemies(squareType, neighborSquareType)) {
                enemyNeighbors.push(pos);
            }

        }

    });

    // now that we have all surrounding enemies, we can figure out if a piece should be taken
    // by looking if there is another enemy on the other side of the enemy piece
    let nextPiecePos, nextPieceSquareType, enemySquareType;
    enemyNeighbors.forEach(function(pos) {

        nextPiecePos = pos - (+lastMove - pos);

        if(isSquareOccupied(nextPiecePos)) {

            enemySquareType = getSquareType(pos);
            nextPieceSquareType = getSquareType(nextPiecePos);

            if(areEnemies(enemySquareType, nextPieceSquareType)) {
                removePiece(pos);
            }

        }

    });

}

//<editor-fold desc="Helpers">

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

function getSquareType(pos) {
    let square = getSquareByPos(pos);
    let pieceSrc = square.children('.piece').attr('src');
    return pieceType(pieceSrc);
}

// returns 1 for King, 0 for King Pawn, and -1 for Attacker Pawn based on img src
// img src corresponds to the name of the file in the img folder
function pieceType(imgSrc) {

    switch(imgSrc) {
        case "img/attacker_pawn.PNG":
            return -1;
        case "img/king_pawn.PNG":
            return 0;
        case "img/king.PNG":
            return 1;
    }

}

function getSquareByPos(pos) {
    return $('td[data-pos=' + pos + ']');
}

function isSquareOccupied(pos) {
    let square = getSquareByPos(pos);
    return (square.attr('data-occupied') === "true");
}

//</editor-fold>

//<editor-fold desc="Move Legality Checking">

// this function assumes that a piece is selected and receives a data-pos value for the destination
// should return true if the move is legal, false otherwise
function isMoveLegal(destination) {

    let legalMoves = getLegalMoves(whichPiece);

    // will be -1 if destination is not in legalMoves
    // will be the position otherwise
    let isLegal = $.inArray(parseInt(destination), legalMoves);

    return (isLegal !== -1);

}

// gets the legal moves from the starting position 'start'
function getLegalMoves(start) {

    let legalMoves = [];
    let i;

    let leftSpaces = getLeftSpaces(start);

    // traverse the array from end to start because it's sorted in ascending fashion
    for(i = leftSpaces.length - 1; i >= 0; i--) {
        if(isSquareOccupied(leftSpaces[i])) {
            break;
        } else {
            legalMoves.push(leftSpaces[i]);
        }
    }

    let rightSpaces = getRightSpaces(start);

    for(i = 0; i < rightSpaces.length; i++) {
        if(isSquareOccupied(rightSpaces[i])) {
            break;
        } else {
            legalMoves.push(rightSpaces[i]);
        }
    }

    let aboveSpaces = getAboveSpaces(start);

    // traverse the array from end to start because it's sorted in ascending fashion
    for(i = aboveSpaces.length - 1; i >= 0; i--) {
        if(isSquareOccupied(aboveSpaces[i])) {
            break;
        } else {
            legalMoves.push(aboveSpaces[i]);
        }
    }

    let belowSpaces = getBelowSpaces(start);

    for(i = 0; i < belowSpaces.length; i++) {
        if(isSquareOccupied(belowSpaces[i])) {
            break;
        } else {
            legalMoves.push(belowSpaces[i]);
        }
    }

    return legalMoves;

}

//</editor-fold>

//<editor-fold desc="Spaces">

// DESC the next series of functions returns spaces indicated by their name that a piece could theoretically move to
// DESC from a given starting position

function getLeftSpaces(start) {

    let spaces = [];
    let i;

    // get spaces to the left
    // check if the value is equivalent to 10 mod 11 because that represents the first right side square
    i = start;
    while(--i % 11 !== 10 && i >= 0) { // need to check if i >= 0 here because mod operator gives neg values once i < 0
        spaces.push(i);
    }

    return spaces.sort(function(a,b) { return a - b });

}

function getRightSpaces(start) {

    let spaces = [];
    let i;

    // get spaces to the right
    // check if the value is equivalent to 0 mod 11 because that represents the first left side square
    i = start;
    while(++i % 11 !== 0) {
        spaces.push(i);
    }

    return spaces.sort(function(a,b) { return a - b });
}

function getAboveSpaces(start) {

    let spaces = [];
    let i;

    // get the spaces above
    i = parseInt(start) - 11;
    while(i >= 0) {
        spaces.push(i);
        i -= 11;
    }

    return spaces.sort(function(a,b) { return a - b });

}

function getBelowSpaces(start) {

    let spaces = [];
    let i;

    // get the spaces below
    i = parseInt(start) + 11;
    while(i <= 120) {
        spaces.push(i);
        i += 11;
    }

    return spaces.sort(function(a,b) { return a - b });

}

function getHorSpaces(start) {

    let leftSpaces = getLeftSpaces(start);
    let rightSpaces = getRightSpaces(start);

    let horSpaces = leftSpaces.concat(rightSpaces);

    return horSpaces.sort(function(a,b) { return a - b });

}

function getVertSpaces(start) {

    let aboveSpaces = getAboveSpaces(start);
    let belowSpaces = getBelowSpaces(start);

    let vertSpaces = aboveSpaces.concat(belowSpaces);

    return vertSpaces.sort(function(a,b) { return a - b });

}

//</editor-fold>