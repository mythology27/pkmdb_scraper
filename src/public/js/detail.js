var modal = document.getElementById('img-lightbox')

function show_modal() {
    modal.style.display = "block"
}

function close_modal() {
    modal.style.display = "none"
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none"
    }
}