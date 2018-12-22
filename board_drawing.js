//<editor-fold desc="Global Variables">

let rows = 11;
let cols = 11;

let gameBoardId = 'game_board';

//</editor-fold>

$(document).ready(function() {

    initBoard();

    let board = document.getElementById(gameBoardId);

    // NOTE this should never trigger when a piece is clicked because of the event.stopPropagation() call in selectPiece in piece_movement.js
    board.addEventListener('click', function(event) {

        // get all of the td squares
        let boardSquares = $("#" + gameBoardId).find("td");

        // remove the selected class from all of them (only one should have it)
        boardSquares.each(function() {
            $(this).removeClass('selected_square');
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
    let space = 0;

    // build the board
    for(let r = 0; r < rows; r++) {

        let col = "";

        // setup the square with it's position
        // also preset all positions to be unoccupied
        for(let c = 0; c < cols; c++) {
            col += "<td data-pos='" + space + "' data-occupied='false' class='board_square'></td>";
            space++;
        }

        $("#" + gameBoardId).append("<tr>" + col + "</tr>");

    }

}

function drawPieces() {

    let totalSpaces = rows * cols;

    // we subtract 1 because the numbering of spaces starts at 0
    // dividing by 2 should yield an integer because the product of rows*cols should be odd
    // or else there wouldn't be a specific center square on the board
    let centerPosition = (totalSpaces - 1) / 2;

    // draw the king piece at the center
    drawKing(centerPosition);

    // draw the king allies
    drawKingPawns(centerPosition);

    // draw the attackers
    drawAttackers();

}

function drawKing(kingPosition) {

    drawPiece('img/king.PNG', kingPosition);

}

function drawKingPawns(kingPosition) {

    // pawns should be drawn 2 above, below, to the right, and to the left
    // they should also be drawn one square diagonal to the king

    let horizontalPositions = [
        kingPosition - 2,
        kingPosition - 1,
        kingPosition + 1,
        kingPosition + 2
    ];

    let verticalPositions = [
        kingPosition - (2 * cols),
        kingPosition - cols,
        kingPosition + cols,
        kingPosition + (2 * cols)
    ];

    let diagonalPositions = [
        kingPosition - cols - 1,
        kingPosition - cols + 1,
        kingPosition + cols - 1,
        kingPosition + cols + 1
    ];

    let positions = horizontalPositions.concat(verticalPositions, diagonalPositions);

    positions.forEach(function(pos) {
        drawPiece('img/king_pawn.PNG', pos);
    });

}

function drawAttackers() {

    // the attackers are in similar formations all around the board
    // there are five against the side and the one in the middle of those one row or column out

    let leftSideAttackers = [
        3 * cols,
        4 * cols,
        5 * cols,
        5 * cols + 1,
        6 * cols,
        7 * cols,
    ];

    let bottomSideAttackers = [
        10 * cols + 3,
        10 * cols + 4,
        10 * cols + 5,
        9 * cols + 5,
        10 * cols + 6,
        10 * cols + 7,
    ];

    let rightSideAttackers = [
        4 * cols - 1,
        5 * cols - 1,
        6 * cols - 1,
        6 * cols - 2,
        7 * cols - 1,
        8 * cols - 1,
    ];

    let topSideAttackers = [
        3,
        4,
        5,
        cols + 5,
        6,
        7
    ];

    let attackers = leftSideAttackers.concat(bottomSideAttackers, rightSideAttackers, topSideAttackers);

    attackers.forEach(function(pos) {
        drawPiece("img/attacker_pawn.PNG", pos);
    });

}

function drawPiece(imgSrc, pos, extraClasses = []) {

    // get the square based on pos
    let pieceSquare = $("#" + gameBoardId).find("td[data-pos=" + pos + "]");

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