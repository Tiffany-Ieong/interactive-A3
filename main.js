// references to DOM elements
const book = document.querySelector("#book");
const paper1 = document.querySelector("#p1");
const paper2 = document.querySelector("#p2");
const paper3 = document.querySelector("#p3");

// drag detection variables for page turning
let dragStartX = 0;
let isDragging = false;

// listen for drag on the book to turn pages
book.addEventListener("mousedown", (e) => {
    dragStartX = e.clientX  // record where the drag started
    isDragging = true
})

book.addEventListener("mouseup", (e) => {
    if (!isDragging) return

    const distance = dragStartX - e.clientX  // positive = dragged left, negative = dragged right

    if (distance > 50) {
        goNextPage()   // dragged left enough — turn forward
    } else if (distance < -50) {
        goPrevPage()   // dragged right enough — turn backward
    }

    isDragging = false
})

// stops the drag if mouse leaves the book area
book.addEventListener("mouseleave", () => {
    isDragging = false
})

// page logic
let currentLocation = 1;
let numOfPapers = 3;
let maxLocation = numOfPapers + 1;

function openBook() {
    book.style.transform = "translateX(50%)";
}

function closeBook(isAtBeginning) {
    if (isAtBeginning) {
        book.style.transform = "translateX(0%)";
    } else {
        book.style.transform = "translateX(100%)";
    }
}

function goNextPage() {
    if (currentLocation < maxLocation) {
        switch (currentLocation) {
            case 1:
                openBook();
                paper1.classList.add("flipped");
                paper1.style.zIndex = 1;
                break;
            case 2:
                paper2.classList.add("flipped");
                paper2.style.zIndex = 2;
                break;
            case 3:
                paper3.classList.add("flipped");
                paper3.style.zIndex = 3;
                closeBook(false);
                break;
            default:
                throw new Error("unknown state");
        }
        currentLocation++;
    }
}

function goPrevPage() {
    if (currentLocation > 1) {
        switch (currentLocation) {
            case 2:
                closeBook(true);
                paper1.classList.remove("flipped");
                paper1.style.zIndex = 3;
                break;
            case 3:
                paper2.classList.remove("flipped");
                paper2.style.zIndex = 2;
                break;
            case 4:
                openBook();
                paper3.classList.remove("flipped");
                paper3.style.zIndex = 1;
                break;
            default:
                throw new Error("unknown state");
        }
        currentLocation--;
    }
}

//----------------------------------------------------------------------

// grab all stickers from the panel
const stickers = document.querySelectorAll('.sticker')

let newX = 0, newY = 0, startX = 0, startY = 0;
let activeSticker = null

// add mousedown and dragstart listeners to every sticker
stickers.forEach(sticker => {
    sticker.addEventListener('mousedown', mouseDown)

    // prevents browser from intercepting the drag as a file drag
    sticker.addEventListener('dragstart', (e) => {
        e.preventDefault()
    })
})

function mouseDown(e) {
    activeSticker = e.target
    startX = e.clientX
    startY = e.clientY

    // get the sticker's current position on screen before moving it
    const rect = activeSticker.getBoundingClientRect()

    // pull the sticker out of the panel and attach it to the body so it can move freely
    document.body.appendChild(activeSticker)
    activeSticker.style.position = 'fixed'
    activeSticker.style.left = rect.left + 'px'
    activeSticker.style.top = rect.top + 'px'
    activeSticker.style.width = '70px'
    activeSticker.style.height = '70px'
    activeSticker.style.zIndex = 1000

    // stop the page turn drag from firing while dragging a sticker
    isDragging = false

    document.addEventListener('mousemove', mouseMove)
    document.addEventListener('mouseup', mouseUp)
}

function mouseMove(e) {
    newX = startX - e.clientX
    newY = startY - e.clientY

    startX = e.clientX
    startY = e.clientY

    activeSticker.style.top = (activeSticker.offsetTop - newY) + 'px'
    activeSticker.style.left = (activeSticker.offsetLeft - newX) + 'px'
}

function mouseUp(e) {
    document.removeEventListener('mousemove', mouseMove)

    if (activeSticker) {
        // at each location, two page faces are visible — the back of the flipped page and the front of the next
        let possiblePageIds = []

        if (currentLocation === 1) {
            possiblePageIds = ['f1']               // only cover showing
        } else if (currentLocation === 2) {
            possiblePageIds = ['b1', 'f2']         // back of paper1 and front of paper2 both visible
        } else if (currentLocation === 3) {
            possiblePageIds = ['b2', 'f3']         // back of paper2 and front of paper3 both visible
        } else if (currentLocation === 4) {
            possiblePageIds = ['b3']               // only last page showing
        }

        let dropped = false

        // check each visible page face to see if sticker was dropped on it
        possiblePageIds.forEach(pageId => {
            if (dropped) return  // stop checking once a match is found

            const currentPage = document.querySelector('#' + pageId)

            if (currentPage) {
                const stickerRect = activeSticker.getBoundingClientRect()
                const pageRect = currentPage.getBoundingClientRect()

                if (
                    stickerRect.left >= pageRect.left &&
                    stickerRect.right <= pageRect.right &&
                    stickerRect.top >= pageRect.top &&
                    stickerRect.bottom <= pageRect.bottom
                ) {
                    const relativeTop = stickerRect.top - pageRect.top
                    const relativeLeft = stickerRect.left - pageRect.left

                    currentPage.appendChild(activeSticker)
                    activeSticker.style.position = 'absolute'
                    activeSticker.style.top = relativeTop + 'px'
                    activeSticker.style.left = relativeLeft + 'px'

                    dropped = true  // found a match, stop checking
                }
            }
        })

        // if not dropped on any page face, leave it floating
        if (!dropped) {
            activeSticker.style.position = 'fixed'
        }
    }

    activeSticker = null

}