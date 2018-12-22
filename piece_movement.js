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