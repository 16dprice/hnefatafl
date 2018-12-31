let isPieceSelected = false;
let whichPiece = {row: -1, col: -1}; // the position of the piece selected
let gameOver = false; // will be set to true if the king is captured
let kingCapturedAlert = 'King Captured!\nAttackers Win >:D';

function selectPiece(piece, event) {

    // so the global board onclick doesn't fire
    event.stopPropagation();

    // if it's not the correct turn to select the piece, don't let the player select it
    let type = pieceType($(piece).attr('src'));
    if(!canSelectPiece(type)) {
        return;
    }

    // remove the class from the previous square
    getSquareByRowCol(whichPiece.row, whichPiece.col).removeClass('selected_square');

    // get the board squares and remove legal move class form all the squares
    let boardSquares = getAllBoardSquares();

    // remove the selected class from all of them (only one should have it)
    // also remove the legal move class from all of them
    boardSquares.each(function() {
        $(this).children('.legal_move_overlay').hide();
    });

    let square = $(piece).parent('td');

    isPieceSelected = true;
    whichPiece.row = square.attr('data-row');
    whichPiece.col = square.attr('data-col');

    // add the class to the new square
    getSquareByRowCol(whichPiece.row, whichPiece.col).addClass('selected_square');

    // highlight all of the legal moves
    let legalMoves = getLegalMoves(whichPiece.row, whichPiece.col);

    let legalSquare;
    legalMoves.forEach(function(rowColArr) {
        legalSquare = getSquareByRowCol(rowColArr[0], rowColArr[1]);
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
    let destinationRow = $(destinationSquare).attr('data-row');
    let destinationCol = $(destinationSquare).attr('data-col');

    // if it's not legal, tell the user and return
    if(!isMoveLegal(destinationRow, destinationCol)) {
        return;
    }

    // by now, the move is legal and we'll move the piece
    // first, we remove the old piece
    // then we build a new piece and place it in the new position
    let selectedSquare = getSquareByRowCol(whichPiece.row, whichPiece.col);
    let pieceSrc = selectedSquare.children('.piece').attr('src');

    removePiece(whichPiece.row, whichPiece.col);

    drawPiece(pieceSrc, destinationRow, destinationCol);

    // see if any pieces were captured
    capturePieces(destinationRow, destinationCol);

    if(gameOver) {
        alert(kingCapturedAlert);
        return;
    }

    // change which turn it is
    whoseTurn = -whoseTurn;

}

// try to capture any pieces based on the last move that was made
function capturePieces(lastMoveRow, lastMoveCol) {

    let squareType = getSquareType(lastMoveRow, lastMoveCol);

    // plus in front of lastMove vars is to cast it as int
    let neighbors = getAdjSquares(lastMoveRow, lastMoveCol);

    // get the enemy neighbors by checking if the adjacent squares are occupied and if they're enemies
    let enemyNeighbors = [];
    let neighborSquareType;
    neighbors.forEach(function (rowColArr) {

        neighborSquareType = getSquareType(rowColArr[0], rowColArr[1]);

        if(areEnemies(squareType, neighborSquareType)) {
            enemyNeighbors.push(rowColArr);
        }

    });

    // now that we have all surrounding enemies, we can figure out if a piece should be taken
    // by looking if there is another enemy on the other side of the enemy piece
    let nextPiecePos, nextPieceSquareType, enemySquareType;
    enemyNeighbors.forEach(function(rowColArr) {
        // draw this out if you want to check
        // this is how to easily get the next consecutive piece
        // first, if they're on the same row
        // if they're not, they'll be on the same column
        if(rowColArr[0] === +lastMoveRow) {
            nextPiecePos = [+lastMoveRow, rowColArr[1] - +lastMoveCol + rowColArr[1]];
        } else {
            nextPiecePos = [rowColArr[0] - +lastMoveRow + rowColArr[0], +lastMoveCol];
        }

        // if the square is the king, do something different
        if(isKing(rowColArr[0], rowColArr[1])) {
            captureKing(rowColArr[0], rowColArr[1]);
        } else {

            // get the square type of the current enemy in focus and the piece on the other side of it
            enemySquareType = getSquareType(rowColArr[0], rowColArr[1]);
            nextPieceSquareType = getSquareType(nextPiecePos[0], nextPiecePos[1]);

            // if the enemy to the piece that was moved is next to another one of it's enemies or a corner piece
            if (areEnemies(enemySquareType, nextPieceSquareType) || isCornerSquare(nextPiecePos[0], nextPiecePos[1])) {
                removePiece(rowColArr[0], rowColArr[1]);
            }

        }

    });

}

function captureKing(kingPosRow, kingPosCol) {

    // NOTE at this point, whatever is calling this function has determined that it should be captured so we're
    // NOTE not checking that the king should be captured
    // NOTE i.e. the king could be in scenario B) listed below by moving itself there and wouldn't actually be captured
    // NOTE because he put himself there, but we're assuming that isn't the case

    // there are a couple scenarios where you can capture the king
    // A) the king is beside one of the corners and there are two pieces on the two leftover sides
    // B) the king is one of the sides, not next to a corner and there are pieces on the other three sides of it
    // C) the king is beside it's starting square and is surrounded on the other three sides
    // D) the king is surrounded on all four sides


    // SCENARIO A
    let kingCapturedByCorner = captureKingByCorner(kingPosRow, kingPosCol);
    if(kingCapturedByCorner) {
        gameOver = true;
        return;
    }

    // SCENARIO B
    let kingCapturedByWall = captureKingByWall(kingPosRow, kingPosCol);
    console.log(kingCapturedByWall);
    if(kingCapturedByWall) {
        gameOver = true;
        return;
    }

    // SCENARIO C
    let kingCapturedByStartingSquare = captureKingByStartingSquare(kingPosRow, kingPosCol);
    if(kingCapturedByStartingSquare) {
        gameOver = true;
        return;
    }

    // SCENARIO D
    let kingCapturedOnAllSides = captureKingOnAllSides(kingPosRow, kingPosCol);
    if(kingCapturedOnAllSides) {
        gameOver = true;
        return;
    }

}

// this function takes a kings position and checks whether or not it is directly beside a corner square
// if it is, then it sees if it is surrounded properly by two attackers to see if it gets captured
function captureKingByCorner(kingPosRow, kingPosCol) {

    // the data-row and data-col values for all squares by corners: 1, 9, 11, 21, 99, 109, 111, 119
    let squaresByCorners = [
        // -------- top of board    --------
        [0, 1],               // first row, second column
        [0, cols - 2],        // first row, second to last column
        [1, 0],               // second row, first column
        [1, cols - 1],        // second row, last column
        // -------- bottom of board --------
        [rows - 2, 0],        // second to last row, first column
        [rows - 2, cols - 1], // second to last row, last column
        [rows - 1, 1],        // last row, second column
        [rows - 1, cols - 2]  // last row, second to last column
    ];

    // if the king isn't in one of these spots, then it obviously can't be captured in one
    if(!isPosInArray([kingPosRow, kingPosCol], squaresByCorners)) {
        return false;
    }

    // the positions the enemies need to be in to capture the king, which are the adjacent squares (minus the corners)
    let enemyCapturePositions = filterOutCornerSquares(getAdjSquares(kingPosRow, kingPosCol));

    // true if all the squares in the array are attackers
    return areSquaresAllAttackers(enemyCapturePositions);

}

function captureKingByWall(kingPosRow, kingPosCol) {

    // check if king really is beside a wall
    // this happens when one of the position variables is 0 or maximized
    // if it's not, return false
    if(!(
        +kingPosRow === 0          ||
        +kingPosRow === (rows - 1) ||
        +kingPosCol === 0          ||
        +kingPosCol === (cols - 1)
    )) {
        return false;
    }

    // the positions the enemies need to be in to capture the king
    // this would include the corner if the king were beside, which can't have pieces in it
    // but that case is handled by captureKingByCorner function
    let enemyCapturePositions = getAdjSquares(kingPosRow, kingPosCol);

    return areSquaresAllAttackers(enemyCapturePositions);

}

// this function takes a kings position and checks whether or not it is beside the starting square
// if it is, then it sees if it is surrounded properly by three attackers to see if it gets captured
function captureKingByStartingSquare(kingPosRow, kingPosCol) {

    // the center square
    let center = [(rows - 1) / 2, (cols - 1) / 2]; // NOTE rows and cols should both be odd

    // squares adjacent to the king
    let adjacentSquares = getAdjSquares(kingPosRow, kingPosCol);

    // see if the center is adjacent to the king, meaning it can be captured here
    if(!isPosInArray(center, adjacentSquares)) {
        return false;
    }

    // now get rid of the center from the adjacent squares so we can check if the
    // rest of the adjacent squares are all attackers easily
    let filteredAdjacentSquares = [];
    adjacentSquares.forEach(function(rowColArr) {
        if(!(rowColArr[0] === center[0] && rowColArr[1] === center[1])) {
            filteredAdjacentSquares.push(rowColArr);
        }
    });

    // true if all the squares in the array are attackers
    return areSquaresAllAttackers(filteredAdjacentSquares);

}

function captureKingOnAllSides(kingPosRow, kingPosCol) {

    // pretty basic
    // if the king was in any *special* spot, the captureKing function would've already caught it
    return areSquaresAllAttackers(getAdjSquares(kingPosRow, kingPosCol));

}

//<editor-fold desc="Move Legality Checking">

// this function assumes that a piece is selected and receives a data-row and data-col value for the destination
// should return true if the move is legal, false otherwise
function isMoveLegal(destinationRow, destinationCol) {

    let legalMoves = getLegalMoves(whichPiece.row, whichPiece.col);

    // check if the move is in the legal moves array and return
    return isPosInArray([destinationRow, destinationCol], legalMoves);

}

// gets the legal moves from the starting position 'start'
function getLegalMoves(startRow, startCol) {

    let legalMoves = [];
    let i;

    let leftSpaces = getLeftSpaces(startRow, startCol);

    // traverse the array from end to start because it's sorted in ascending fashion
    for(i = leftSpaces.length - 1; i >= 0; i--) {
        if(isSquareOccupied(leftSpaces[i][0], leftSpaces[i][1])) {
            break;
        } else {
            legalMoves.push(leftSpaces[i]);
        }
    }

    let rightSpaces = getRightSpaces(startRow, startCol);

    for(i = 0; i < rightSpaces.length; i++) {
        if(isSquareOccupied(rightSpaces[i][0], rightSpaces[i][1])) {
            break;
        } else {
            legalMoves.push(rightSpaces[i]);
        }
    }

    let aboveSpaces = getAboveSpaces(startRow, startCol);

    // traverse the array from end to start because it's sorted in ascending fashion
    for(i = aboveSpaces.length - 1; i >= 0; i--) {
        if(isSquareOccupied(aboveSpaces[i][0], aboveSpaces[i][1])) {
            break;
        } else {
            legalMoves.push(aboveSpaces[i]);
        }
    }

    let belowSpaces = getBelowSpaces(startRow, startCol);

    for(i = 0; i < belowSpaces.length; i++) {
        if(isSquareOccupied(belowSpaces[i][0], belowSpaces[i][1])) {
            break;
        } else {
            legalMoves.push(belowSpaces[i]);
        }
    }

    // filter out the corners if the current piece isn't the king
    if(!isKing(whichPiece.row, whichPiece.col)) {
        let filteredLegalMoves = [];
        legalMoves.forEach(function(rowColArr) {
            if(!isCornerSquare(rowColArr[0], rowColArr[1])) filteredLegalMoves.push(rowColArr);
        });
        return filteredLegalMoves;
    }

    return legalMoves;

}

//</editor-fold>

//<editor-fold desc="Spaces">

// DESC the next series of functions returns spaces indicated by their data-row and data-col value that a piece could
// DESC theoretically move to from a given starting position

function getLeftSpaces(startRow, startCol) {

    let spaces = [];
    let i;

    // start at startCol - 1 because we don't want to include the current space
    for(i = +startCol - 1; i >= 0; i--) {
        spaces.push([+startRow, i]);
    }

    // sort by the column value
    return spaces.sort(function(a,b) { return a[1] - b[1] });

}

function getRightSpaces(startRow, startCol) {

    let spaces = [];
    let i;

    // start at startCol + 1 because we don't want to include the current space
    for(i = +startCol + 1; i <= cols; i++) {
        spaces.push([+startRow, i]);
    }

    // sort by the column value
    return spaces.sort(function(a,b) { return a[1] - b[1] });
}

function getAboveSpaces(startRow, startCol) {

    let spaces = [];
    let i;

    // start at startRow - 1 because we don't want to include the current space
    for(i = +startRow - 1; i >= 0; i--) {
        spaces.push([i, +startCol]);
    }

    // sort by the row value
    return spaces.sort(function(a,b) { return a[0] - b[0] });

}

function getBelowSpaces(startRow, startCol) {

    let spaces = [];
    let i;

    // start at startRow + 1 because we don't want to include the current space
    for(i = +startRow + 1; i <= rows; i++) {
        spaces.push([i, +startCol]);
    }

    // sort by the row value
    return spaces.sort(function(a,b) { return a[0] - b[0] });

}

function getHorSpaces(startRow, startCol) {

    let leftSpaces = getLeftSpaces(startRow, startCol);
    let rightSpaces = getRightSpaces(startRow, startCol);

    let horSpaces = leftSpaces.concat(rightSpaces);

    // sort by the column value
    return horSpaces.sort(function(a,b) { return a[1] - b[1] });

}

function getVertSpaces(startRow, startCol) {

    let aboveSpaces = getAboveSpaces(startRow, startCol);
    let belowSpaces = getBelowSpaces(startRow, startCol);

    let vertSpaces = aboveSpaces.concat(belowSpaces);

    // sort by the row value
    return vertSpaces.sort(function(a,b) { return a[0] - b[0] });

}

//</editor-fold>
