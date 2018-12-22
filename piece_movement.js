let isPieceSelected = false;
let whichPiece = -1; // the position of the piece selected

function selectPiece(piece, event) {

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
    let selectedSquare = $('td[data-pos=' + whichPiece + ']');
    let pieceSrc = selectedSquare.children('.piece').attr('src');

    selectedSquare.empty();
    selectedSquare.attr('data-occupied', 'false');

    drawPiece(pieceSrc, destination);

}

// dummy function for now
// this function assumes that a piece is selected and receives a data-pos value for the destination
// should return true if the move is legal, false otherwise
function isMoveLegal(destination) {

    return true;

}