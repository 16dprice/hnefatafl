//<editor-fold desc="Global Variables">

let rows = 11;
let cols = 11;

let whoseTurn = -1; // -1 for attackers turn, 1 for king side turn

let gameBoardId = 'game_board';

//</editor-fold>

$(document).ready(function() {

    initBoard();

    let board = document.getElementById(gameBoardId);

    // NOTE this should never trigger when a piece is clicked because of the event.stopPropagation() call in selectPiece in piece_movement.js
    board.addEventListener('click', function(event) {

        // try to move the piece first
        movePiece(event);

        // get all of the td squares
        let boardSquares = getAllBoardSquares();

        // remove the selected class from all of them (only one should have it)
        // also remove the legal move class from all of them
        boardSquares.each(function() {
            $(this).removeClass('selected_square');
            $(this).children('.legal_move_overlay').hide();
        });

        // no piece is selected now
        isPieceSelected = false;

    });


});

function initBoard() {

    drawBoard();
    drawPieces();

}

function drawBoard() {

    // this will count which space we are on
    // each space will have a data-pos attribute increasing first from left to right then top to bottom
    let td;

    // build the board
    for(let r = 0; r < rows; r++) {

        let col = "";

        // setup the square with it's position
        // also preset all positions to be unoccupied
        for(let c = 0; c < cols; c++) {

            td = $(document.createElement('td'));
            td.attr('data-row', r);
            td.attr('data-col', c);
            td.attr('data-occupied', 'false');
            td.attr('class', 'board_square');

            col += td.get(0).outerHTML; // get the td as html string
        }

        // console.log(col);

        $("#" + gameBoardId).append("<tr>" + col + "</tr>");

    }

    // append all overlay images
    for(let r = 0; r < rows; r++) {
        for(let c = 0; c < cols; c++) {
            drawLegalMoveOverlayImage(r, c);
        }
    }

}

function drawPieces() {

    // we subtract 1 because the numbering of spaces starts at 0
    // dividing by 2 should yield an integer because rows and cols should both be odd
    // or else there wouldn't be a specific center square on the board
    let centerRow = (rows - 1) / 2;
    let centerCol = (cols - 1) / 2;

    // draw the king piece at the center
    drawKing(centerRow, centerCol);

    // draw the king allies
    drawKingPawns(centerRow, centerCol);

    // draw the attackers
    drawAttackers();

}

function drawKing(kingRow, kingCol) {

    drawPiece('img/king.PNG', kingRow, kingCol);

}

function drawKingPawns(kingRow, kingCol) {

    // pawns should be drawn 2 above, below, to the right, and to the left
    // they should also be drawn one square diagonal to the king

    let horizontalPositions = [
        [kingRow - 2, kingCol],
        [kingRow - 1, kingCol],
        [kingRow + 1, kingCol],
        [kingRow + 2, kingCol]
    ];

    let verticalPositions = [
        [kingRow, kingCol - 2],
        [kingRow, kingCol - 1],
        [kingRow, kingCol + 1],
        [kingRow, kingCol + 2]
    ];

    let diagonalPositions = [
        [kingRow - 1, kingCol - 1],
        [kingRow + 1, kingCol - 1],
        [kingRow + 1, kingCol + 1],
        [kingRow - 1, kingCol + 1]
    ];

    let positions = horizontalPositions.concat(verticalPositions, diagonalPositions);

    positions.forEach(function(rowColArr) {
        drawPiece('img/king_pawn.PNG', rowColArr[0], rowColArr[1]); // row is at index 0, col at index 1
    });

}

function drawAttackers() {

    // the attackers are in similar formations all around the board
    // there are five against the side and the one in the middle of those one row or column out

    let leftSideAttackers = [
        [3, 0],
        [4, 0],
        [5, 0],
        [5, 1],
        [6, 0],
        [7, 0]
    ];

    let bottomSideAttackers = [
        [10, 3],
        [10, 4],
        [10, 5],
        [9,  5],
        [10, 6],
        [10, 7]
    ];

    let rightSideAttackers = [
        [3, 10],
        [4, 10],
        [5, 10],
        [5,  9],
        [6, 10],
        [7, 10]
    ];

    let topSideAttackers = [
        [0, 3],
        [0, 4],
        [0, 5],
        [1, 5],
        [0, 6],
        [0, 7]
    ];

    let attackers = leftSideAttackers.concat(bottomSideAttackers, rightSideAttackers, topSideAttackers);

    attackers.forEach(function(rowColArr) {
        drawPiece("img/attacker_pawn.PNG", rowColArr[0], rowColArr[1]); // row is at index 0, col at index 1
    });

}