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

// returns -1, 0, or 1 based on the pieceType function
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

// returns true if king is at pos
// false otherwise
function isKing(pos) {
    return (getSquareType(pos) === 1);
}

// since whoseTurn is -1 for attackers and 1 for king side, we can just check to see if
// the selected piece and the whoseTurn variables are enemies (see pieceType() function)
// if they are, you can't move
// else you can move
function correctTurn() {

    return !(areEnemies(whoseTurn, getSquareType(whichPiece)));

}

// similar to correctTurn()
function canSelectPiece(pieceType) {
    return !(areEnemies(whoseTurn, pieceType));
}

// returns the td with data-pos value equal to pos
function getSquareByPos(pos) {
    return $('td[data-pos=' + pos + ']');
}

// true if the square is occupied by ANY piece
// false otherwise
function isSquareOccupied(pos) {
    let square = getSquareByPos(pos);
    return (square.attr('data-occupied') === "true");
}

// true if the square is occupied by an attacker
// false otherwise
function isSquareAttacker(pos) {
    if(isSquareOccupied(pos)) {
        return (getSquareType(pos) === -1); // attackers are represented by -1
    }
}

// posArray is an array of data-pos values i.e. [1, 3, 100, ...]
// returns true if all positions in the array are occupied by attackers
// false if even one of them is not
function areSquaresAllAttackers(posArray) {
    posArray.forEach(function(pos) {
        if(!isSquareAttacker(pos)) return false;
    });
    return true;
}

// get a jQuery array of td elements
function getAllBoardSquares() {
    return $("#" + gameBoardId).find("td");
}