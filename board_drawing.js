let rows = 11;
let cols = 11;


$(document).ready(function() {

    drawBoard('game_board');
    drawPieces('game_board');

});

function drawBoard(gameBoardId) {

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

function drawPieces(gameBoardId) {

    let totalSpaces = rows * cols;

    // we subtract 1 because the numbering of spaces starts at 0
    // dividing by 2 should yield an integer because the product of rows*cols should be odd
    // or else there wouldn't be a specific center square on the board
    let centerPosition = (totalSpaces - 1) / 2;

    // draw the king piece at the center
    drawKing(gameBoardId, centerPosition);

    // draw the king allies
    drawKingPawns(gameBoardId, centerPosition);

    // draw the attackers
    drawAttackers();

}

function drawKing(gameBoardId, kingPosition) {

    // get the king square as a jQuery object
    let kingSquare = $("#" + gameBoardId).find("td[data-pos=" + kingPosition + "]");

    // create the king image
    let img = $(document.createElement('img'));
    img.attr('src', 'img/king.PNG');
    img.attr('class', 'piece');

    // put the king piece on the board
    kingSquare.append(img);
    kingSquare.attr('data-occupied', 'true');

}

function drawKingPawns(gameBoardId, kingPosition) {

    // pawns should be drawn 2 above, below, to the right, and to the left
    // they should also be drawn one square diagonal to the king

    let horizontalPositions = [
        kingPosition - 2,
        kingPosition - 1,
        kingPosition + 1,
        kingPosition + 2
    ];

    horizontalPositions.forEach(function(pos) {
        // get the pawn square
        let pawnSquare = $("#" + gameBoardId).find("td[data-pos=" + pos + "]");

        // create the pawn image
        let img = $(document.createElement('img'));
        img.attr('src', 'img/king_pawn.PNG');
        img.attr('class', 'piece');

        // place the piece
        pawnSquare.append(img);
    });

    let verticalPositions = [
        kingPosition - (2 * cols),
        kingPosition - cols,
        kingPosition + cols,
        kingPosition + (2 * cols)
    ];

    verticalPositions.forEach(function(pos) {
        // get the pawn square
        let pawnSquare = $("#" + gameBoardId).find("td[data-pos=" + pos + "]");

        // create the pawn image
        let img = $(document.createElement('img'));
        img.attr('src', 'img/king_pawn.PNG');
        img.attr('class', 'piece');

        // place the piece
        pawnSquare.append(img);
    });

    let diagonalPositions = [
        kingPosition - cols - 1,
        kingPosition - cols + 1,
        kingPosition + cols - 1,
        kingPosition + cols + 1
    ];

    diagonalPositions.forEach(function(pos) {
        // get the pawn square
        let pawnSquare = $("#" + gameBoardId).find("td[data-pos=" + pos + "]");

        // create the pawn image
        let img = $(document.createElement('img'));
        img.attr('src', 'img/king_pawn.PNG');
        img.attr('class', 'piece');

        // place the piece
        pawnSquare.append(img);
    });

}

function drawAttackers() {



}