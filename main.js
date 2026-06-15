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
    dragStartX = e.clientX
    isDragging = true
})

book.addEventListener("mouseup", (e) => {
    if (!isDragging) return

    const distance = dragStartX - e.clientX

    if (distance > 50) {
        goNextPage()
    } else if (distance < -50) {
        goPrevPage()
    }

    isDragging = false
})

book.addEventListener("mouseleave", () => {
    isDragging = false
})

// page logic
let currentLocation = 1;
let numOfPapers = 3;
let maxLocation = numOfPapers + 1;

function openBook() {
    book.style.transform = "translateX(30%)";
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
    paper2.style.zIndex = 0
    paper3.style.display = 'none'    // hide paper3 immediately
    paper1.classList.add("flipped");
    paper1.style.zIndex = 1;
    setTimeout(() => {
        paper3.style.display = 'block'  // bring paper3 back after flip finishes
        paper2.style.zIndex = 2
        paper3.style.zIndex = 1
    }, 500)
    break;
            case 2:
                // push paper3 behind during the flip so it doesn't bleed through
                paper3.style.zIndex = 0
                paper2.classList.add("flipped");
                paper2.style.zIndex = 2;
                setTimeout(() => {
                    paper3.style.zIndex = 1
                }, 500)
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
    paper2.style.zIndex = 0
    paper1.style.display = 'none'    // hide paper1 immediately so it doesn't block
    paper3.classList.remove("flipped");
    paper3.style.zIndex = 1;
    setTimeout(() => {
        paper1.style.display = 'block'  // bring paper1 back after flip finishes
        paper2.style.zIndex = 2
    }, 500)
    break;
        }
        currentLocation--;
    }
}

//----------------------------------------------------------------------

const stickers = document.querySelectorAll('.sticker')

let newX = 0, newY = 0, startX = 0, startY = 0;
let activeSticker = null
let originalSticker = null  // keeps reference to the original in the panel

stickers.forEach(sticker => {
    sticker.addEventListener('mousedown', mouseDown)
    sticker.addEventListener('dragstart', (e) => {
        e.preventDefault()
    })
})

function mouseDown(e) {
    originalSticker = e.target  // remember the original in the panel

    startX = e.clientX
    startY = e.clientY

    const rect = e.target.getBoundingClientRect()

    // hide the original in the panel — keeps the gap but makes it invisible
    originalSticker.style.visibility = 'hidden'

    // create a copy to drag so it starts at the same visual position
    const clone = e.target.cloneNode(true)
    activeSticker = clone
    document.body.appendChild(clone)
    activeSticker.style.position = 'fixed'
    activeSticker.style.left = rect.left + 'px'
    activeSticker.style.top = rect.top + 'px'
    activeSticker.style.width = rect.width + 'px'   // preserve the sticker's original size
    activeSticker.style.height = rect.height + 'px'
    activeSticker.style.zIndex = 1000
    activeSticker.style.visibility = 'visible'

    isDragging = false

    activeSticker.addEventListener('dragstart', (e) => {
        e.preventDefault()
    })

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
        let possiblePageIds = []

        if (currentLocation === 1) {
            possiblePageIds = ['f1']
        } else if (currentLocation === 2) {
            possiblePageIds = ['b1', 'f2']
        } else if (currentLocation === 3) {
            possiblePageIds = ['b2', 'f3']
        } else if (currentLocation === 4) {
            possiblePageIds = ['b3']
        }

        let dropped = false

        possiblePageIds.forEach(pageId => {
            if (dropped) return

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
                    activeSticker.style.objectFit = 'contain'

                    // sticker successfully placed — keep the gap in the panel empty
                    dropped = true
                }
            }
        })

        if (!dropped) {
            // dropped outside a page — remove the clone and restore the original in the panel
            activeSticker.remove()
            originalSticker.style.visibility = 'visible'
        }
    }

    activeSticker = null
    originalSticker = null
}