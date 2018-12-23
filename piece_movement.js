let isPieceSelected = false;
let whichPiece = -1; // the position of the piece selected

function selectPiece(piece, event) {

    // so the global board onclick doesn't fire
    event.stopPropagation();

    // remove the class from the previous square
    getSquareByPos(whichPiece).removeClass('selected_square');

    // get the board squares and remove legal move class form all the squares
    let boardSquares = getAllBoardSquares();

    // remove the selected class from all of them (only one should have it)
    // also remove the legal move class from all of them
    boardSquares.each(function() {
        $(this).children('.legal_move_overlay').hide();
    });

    let square = $(piece).parent('td');

    isPieceSelected = true;
    whichPiece = square.attr('data-pos');

    // add the class to the new square
    getSquareByPos(whichPiece).addClass('selected_square');

    // highlight all of the legal moves
    let legalMoves = getLegalMoves(whichPiece);

    let legalSquare;
    legalMoves.forEach(function(pos) {
        legalSquare = getSquareByPos(pos);
        $(legalSquare).children('.legal_move_overlay').show();
    });

}

// this function will never trigger when a piece is clicked so there's no need to check if the destination has a piece already on it
function movePiece(event) {

    // if there's nothing selected, we can't do anything
    if(!isPieceSelected) {
        return;
    }

    // decides if it's the correct turn for the piece to move based on whichPiece and whoseTurn variables
    if(!correctTurn()) {
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

    // change which turn it is
    whoseTurn = -whoseTurn;

}

// since whoseTurn is -1 for attackers and 1 for king side, we can just check to see if
// the selected piece and the whoseTurn variables are enemies (see pieceType() function)
// if they are, you can't move
// else you can move
function correctTurn() {

    return !(areEnemies(whoseTurn, getSquareType(whichPiece)));

}

// try to capture any pieces based on the last move that was made
function capturePieces(lastMove) {

    let squareType = getSquareType(lastMove);

    // plus in front of lastMove is to cast it as int
    let neighbors = [
        +lastMove - 11, // top
        +lastMove + 11 // bottom
    ];
    // only push the squares to the left and right if they don't move to the previous or next row
    console.log(+lastMove % 11);
    if(+lastMove % 11 !== 0) {
        neighbors.push(+lastMove - 1); // left
    }
    if(+lastMove % 11 !== 10) {
        neighbors.push(+lastMove + 1); // right
    }

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
    let nextPiecePos, nextPieceSquareType, enemySquareType, diffRows;
    enemyNeighbors.forEach(function(pos) {

        nextPiecePos = pos - (+lastMove - pos);

        // if the two pieces are on different rows
        if(
            (nextPiecePos % 11 === 10 && pos % 11 === 0) ||
            (nextPiecePos % 11 === 0 && pos % 11 === 10)
        ) {
            diffRows = true;
        }

        // if the square is occupied and not on a different row
        if(isSquareOccupied(nextPiecePos) && !diffRows) {

            enemySquareType = getSquareType(pos);
            nextPieceSquareType = getSquareType(nextPiecePos);

            if(areEnemies(enemySquareType, nextPieceSquareType)) {
                removePiece(pos);
            }

        }

    });

}

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
