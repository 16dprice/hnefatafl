function pickUpPiece(element, event) {

    element.ondragstart = function() {
        return false;
    };

    $(element).fadeTo("fast", 0.3);

    let img = $(document.createElement('img'));
    img.ondragstart = function() {
        return false;
    };
    img.attr('src', 'img/king.PNG');
    img.css({position: 'absolute', zIndex: 1000});
    img.attr('class', 'piece');
    $("body").append(img);

    moveAt(event.pageX, event.pageY);

    // centers the ball at (pageX, pageY) coordinates
    function moveAt(pageX, pageY) {
        img.css({left: pageX - 20 + 'px', top: pageY - 20 + 'px'});
    }

    function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
    }

    // (3) move the ball on mousemove
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        img.remove();
    }

}