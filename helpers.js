// NOTE a file full of various helper functions

//<editor-fold desc="Drawing">

function drawPiece(imgSrc, pos, extraClasses = []) {

    // get the square based on pos
    let pieceSquare = getSquareByPos(pos);

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

function removePiece(pos) {

    let square = getSquareByPos(pos);

    square.children('.piece').remove();
    square.attr('data-occupied', 'false');

}

function drawLegalMoveOverlayImage(pos) {

    let img = $(document.createElement('img'));
    img.attr('src', 'img/legal_move_overlay.PNG');
    img.attr('class', 'legal_move_overlay');
    img.attr('data-pos', pos);
    img.hide(); // hiding them initially because no move is selected

    let square = getSquareByPos(pos);
    square.append(img);

}

//</editor-fold>

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

function getAllBoardSquares() {
    return $("#" + gameBoardId).find("td");
}