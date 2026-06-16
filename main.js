// references to DOM elements
const book = document.querySelector("#book");
const paper1 = document.querySelector("#p1");
const paper2 = document.querySelector("#p2");
const paper3 = document.querySelector("#p3");

// drag detection variables for page turning
let dragStartX = 0;
let isDragging = false;

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
                paper3.style.display = 'none'
                paper1.classList.add("flipped");
                paper1.style.zIndex = 1;
                setTimeout(() => {
                    paper3.style.display = 'block'
                    paper2.style.zIndex = 2
                    paper3.style.zIndex = 1
                }, 500)
                break;
            case 2:
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
                paper1.style.display = 'none'
                paper3.classList.remove("flipped");
                paper3.style.zIndex = 1;
                setTimeout(() => {
                    paper1.style.display = 'block'
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
let originalSticker = null
let selectedWrapper = null   // tracks the currently selected wrapper

// lock the currently selected wrapper — hides the outline and handle
function lockSticker() {
    if (selectedWrapper) {
        selectedWrapper.style.outline = 'none'
        const handle = selectedWrapper.querySelector('.resize-handle')
        if (handle) handle.style.display = 'none'
        selectedWrapper = null
    }
}

// show the outline and handle on a wrapper
function selectWrapper(wrapper) {
    if (selectedWrapper && selectedWrapper !== wrapper) {
        lockSticker()
    }
    selectedWrapper = wrapper
    wrapper.style.outline = '2px dashed rgba(64,139,134,0.8)'
    const handle = wrapper.querySelector('.resize-handle')
    if (handle) handle.style.display = 'flex'
}

// clicking anywhere outside a selected wrapper locks it
document.addEventListener('click', (e) => {
    if (selectedWrapper &&
        !selectedWrapper.contains(e.target) &&
        selectedWrapper.dataset.ready === 'true') {
        lockSticker()
    }
})

function createStickerWrapper(stickerImg, parentPage) {
    const size = parseInt(stickerImg.style.width) || 70

    // wrapper div that holds the sticker and resize handle together
    const wrapper = document.createElement('div')
    wrapper.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        top: ${stickerImg.style.top};
        left: ${stickerImg.style.left};
        cursor: pointer;
        z-index: 500;
    `

    // sticker fills the wrapper
    stickerImg.style.position = 'relative'
    stickerImg.style.width = '100%'
    stickerImg.style.height = '100%'
    stickerImg.style.top = '0'
    stickerImg.style.left = '0'
    stickerImg.style.objectFit = 'contain'

    // resize handle at bottom right corner
    const handle = document.createElement('div')
    handle.className = 'resize-handle'
    handle.innerHTML = '&#x2921;'  // diagonal arrow ⤡
    handle.style.cssText = `
        position: absolute;
        bottom: -10px;
        right: -10px;
        width: 20px;
        height: 20px;
        background: white;
        border: 2px solid rgba(64,139,134,0.8);
        border-radius: 4px;
        display: none;
        align-items: center;
        justify-content: center;
        cursor: nwse-resize;
        font-size: 14px;
        color: rgba(64,139,134,0.8);
        z-index: 10;
        user-select: none;
    `

    wrapper.appendChild(stickerImg)
    wrapper.appendChild(handle)
    parentPage.appendChild(wrapper)

    // clicking wrapper selects it
    wrapper.addEventListener('click', (e) => {
        e.stopPropagation()
        selectWrapper(wrapper)
    })

    // mousedown on wrapper lets you drag it when selected
    wrapper.addEventListener('mousedown', (e) => {
        if (e.target === handle) return  // handle has its own drag logic
        if (selectedWrapper !== wrapper) return  // only draggable when selected

        e.stopPropagation()
        isDragging = false

        startX = e.clientX
        startY = e.clientY

        const rect = wrapper.getBoundingClientRect()
        document.body.appendChild(wrapper)
        wrapper.style.position = 'fixed'
        wrapper.style.left = rect.left + 'px'
        wrapper.style.top = rect.top + 'px'
        wrapper.style.zIndex = 1000

        activeSticker = wrapper

        document.addEventListener('mousemove', mouseMove)
        document.addEventListener('mouseup', mouseUp)
    })

    // dragging the handle resizes the wrapper proportionally
    handle.addEventListener('mousedown', (e) => {
        e.stopPropagation()
        isDragging = false

        const startMouseX = e.clientX
        const startMouseY = e.clientY
        const startSize = wrapper.offsetWidth

        function onResizeMove(e) {
            const dx = e.clientX - startMouseX
            const dy = e.clientY - startMouseY
            // average dx and dy for proportional resize
            const delta = (dx + dy) / 2
            const newSize = Math.min(500, Math.max(10, startSize + delta))
            wrapper.style.width = newSize + 'px'
            wrapper.style.height = newSize + 'px'
        }

        function onResizeUp() {
            document.removeEventListener('mousemove', onResizeMove)
            document.removeEventListener('mouseup', onResizeUp)
        }

        document.addEventListener('mousemove', onResizeMove)
        document.addEventListener('mouseup', onResizeUp)
    })

    // show the outline and handle immediately after placing
    selectWrapper(wrapper)

    // small delay before click-to-lock activates so the drop mouseup doesn't immediately lock it
    setTimeout(() => {
        wrapper.dataset.ready = 'true'
    }, 100)

    return wrapper
}

stickers.forEach(sticker => {
    sticker.addEventListener('mousedown', mouseDown)
    sticker.addEventListener('dragstart', (e) => {
        e.preventDefault()
    })
})

function mouseDown(e) {
    originalSticker = e.target

    startX = e.clientX
    startY = e.clientY

    const rect = e.target.getBoundingClientRect()

    // hide original in panel to leave a gap
    originalSticker.style.visibility = 'hidden'

    // create a clone to drag
    const clone = e.target.cloneNode(true)
    activeSticker = clone
    document.body.appendChild(clone)
    activeSticker.style.position = 'fixed'
    activeSticker.style.left = rect.left + 'px'
    activeSticker.style.top = rect.top + 'px'
    activeSticker.style.width = rect.width + 'px'
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
    if (!activeSticker) return
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

                    // set position before wrapping
                    activeSticker.style.top = relativeTop + 'px'
                    activeSticker.style.left = relativeLeft + 'px'

                    // wrap the sticker with the resize handle
                    createStickerWrapper(activeSticker, currentPage)

                    dropped = true
                }
            }
        })

        if (!dropped) {
            // not dropped on a page — remove clone and restore original
            activeSticker.remove()
            if (originalSticker) {
                originalSticker.style.visibility = 'visible'
            }
        }
    }

    activeSticker = null
    originalSticker = null
}