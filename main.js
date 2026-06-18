// ============================================================
// PART 1 — PAGE TURNING
// the page turning function is referencing this youtube video:
// https://youtu.be/0kD6ff2J3BQ?si=in4orvxzq70eiccH
// ============================================================

// get references to the book and each paper so JS can control them
const book = document.querySelector("#book");
const paper1 = document.querySelector("#p1");
const paper2 = document.querySelector("#p2");
const paper3 = document.querySelector("#p3");

// these two variables track the drag used to turn pages
// dragStartX stores where the mouse was when the drag started
let dragStartX = 0;
// isDragging is a flag that tells if the user is currently dragging the book
let isDragging = false;

// the reference video is base on clicking so the interaction was changed to dragging
// when the user presses down on the book, record the starting x position and begin tracking
book.addEventListener("mousedown", (e) => {
    dragStartX = e.clientX
    isDragging = true // set the flag to true so JS knows a drag is happening
})

book.addEventListener("mouseup", (e) => {
    if (!isDragging) return
    const distance = dragStartX - e.clientX

    if (distance > 50) {
        goNextPage() // if the user dragged left more than 50px, turn to the next page
    } else if (distance < -50) {
        goPrevPage() // if the user dragged right more than 50px, go back to the previous page
    }
    isDragging = false // reset when the drag is finished
})

book.addEventListener("mouseleave", () => {
    isDragging = false // if the mouse leaves the book area, cancel the drag
})

// currentLocation tracks which page we are currently on
let currentLocation = 1;
let numOfPapers = 3; // total number of the papers
let maxLocation = numOfPapers + 1;
// the maximum location is one more than the number of papers, which is the last cover page

// openBook shifts the book to the right to reveal both sides when open
function openBook() {
    book.style.transform = "translateX(30%)";
    // moves the book 30% to the right so both pages are visible
}

// closeBook shifts the book back depending on whether we are at the start or end
function closeBook(isAtBeginning) {
    if (isAtBeginning) {
        book.style.transform = "translateX(0%)";
    } else {
        book.style.transform = "translateX(100%)";
    }
    // shifts the book sitting in the centred position when it is closed
}

// turning forward to the next page
function goNextPage() {
    if (currentLocation < maxLocation) {
        switch (currentLocation) {
            case 1:
                openBook();
                paper2.style.zIndex = 0
                // temporarily push paper2 behind so it doesn't block the flip animation
                paper3.style.display = 'none'
                // hide paper3 completely so it doesn't flash through during the animation
                // these two lines were added as there is a bug that paper pops up and blocks the cover before the turning animation ends
                paper1.classList.add("flipped");
                // adding the flipped class triggers the CSS flip animation on paper1
                paper1.style.zIndex = 1;
                setTimeout(() => {
                    // after 500ms (when the animation finishes), restore everything
                    paper3.style.display = 'block'
                    paper2.style.zIndex = 2
                    paper3.style.zIndex = 1
                }, 500)
                break;
            case 2:
                paper3.style.zIndex = 0
                // push paper3 behind so it doesn't bleed through during the flip
                paper2.classList.add("flipped");
                paper2.style.zIndex = 2;
                setTimeout(() => {
                    paper3.style.zIndex = 1
                    // restore paper3 after the animation finishes
                }, 500)
                break;
            case 3:
                paper3.classList.add("flipped");
                paper3.style.zIndex = 3;
                closeBook(false);
                // false means we are at the end, so book slides off screen
                break;
            default:
                throw new Error("unknown state");
        }
        currentLocation++; // move to the next location after turning
    }
}

// function turning pages backward
function goPrevPage() {
    if (currentLocation > 1) {
        // only go back if we are not already at the cover
        switch (currentLocation) {
            case 2:
                // unflip paper1 to go back to the cover
                closeBook(true);
                // true means we are at the beginning, so book returns to centre
                paper1.classList.remove("flipped");
                // removing the flipped class animates the page back to its original position
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
                // hide paper1 so it doesn't block the flip animation
                // this is new from the tutorial as the same bug happens where
                // the second page is blocking the animation
                paper3.classList.remove("flipped");
                paper3.style.zIndex = 1;
                setTimeout(() => {
                    paper1.style.display = 'block'
                    // bring paper1 back after the animation finishes
                    paper2.style.zIndex = 2
                }, 500)
                break;
        }
        currentLocation--; // move back to the previous location
    }
}


// ============================================================
// PART 2 — DRAG AND DROP STICKERS
// this is the reference youtube tutorial for the sticker dragging function:
// https://youtu.be/ymDjvycjgUM?si=3oNMNE0sWxnHY9EC
// the video moves a single yellow memo, but this project moves multiple stickers
// so the script was adjusted to loop through all stickers and track which one is active
// ============================================================

// grab every img element inside the sticker panel at once
const stickers = document.querySelectorAll('.sticker')

// these variables are the memory slots used during dragging
let newX = 0, newY = 0, startX = 0, startY = 0;
// startX and startY record where the sticker is when the page first loads
// newX and newY help calculate the distance between the new and old position
let stickerZIndex = 600
let dragOriginX = 0
// saves the true starting x position when the drag begins
let dragOriginY = 0
// saves the true starting y position when the drag begins, used in mouseUp to detect accidental clicks

let activeSticker = null
// activeSticker tracks which sticker is currently being dragged

let originalSticker = null
// originalSticker keeps a reference to the original image in the panel
// so we can show or hide it depending on whether the drag was successful

// loop through every sticker and attach event listeners
stickers.forEach(sticker => {
    sticker.addEventListener('mousedown', mouseDown)
    // listen for when the user presses down on this sticker, and when they do, run the mouseDown function

    sticker.addEventListener('dragstart', (e) => {
        e.preventDefault()
        // prevents the browser from doing its own built-in image drag
    })
})

function mouseDown(e) {
    originalSticker = e.target
    // e.target is whichever sticker was clicked

    startX = e.clientX
    startY = e.clientY
    // record the x and y coordinates of the mouse position at the moment of clicking
    dragOriginX = e.clientX
    dragOriginY = e.clientY
    // save the true starting position separately, startX and startY update every frame during mousemove
    // dragOriginX and dragOriginY never change, so mouseUp can compare them to detect accidental clicks

    // new added from the reference video to accomplish the sticker panel
    const rect = e.target.getBoundingClientRect()
    // getBoundingClientRect returns the exact position and size of the sticker on screen

    originalSticker.style.visibility = 'hidden'
    // hide the original sticker in the panel
    // it still stays in place but becomes invisible
    // the other stickers won't move up, keeping the gap between them when a sticker is taken
    // keeping the gap between them fits the aesthetic of a sticker pack

    // create an identical copy of the sticker to drag around
    const clone = e.target.cloneNode(true)
    // cloneNode(true) makes an exact copy including any child elements
    activeSticker = clone
    // set the clone as the active sticker being dragged

    document.body.appendChild(clone)
    // add the clone directly to the body so it can float freely over everything

    // position the clone exactly where the original was so it feels seamless
    activeSticker.style.position = 'fixed'
    // fixed positioning lets us place it anywhere on screen using top and left
    activeSticker.style.left = rect.left + 'px'
    activeSticker.style.top = rect.top + 'px'
    activeSticker.style.width = rect.width + 'px'
    activeSticker.style.height = rect.height + 'px'
    // copy the original sticker's exact size so the clone looks identical
    activeSticker.style.zIndex = 1000
    // put the clone on top of everything so it floats above the book and panel
    activeSticker.style.visibility = 'visible'
    // make sure the clone is visible even though the original is hidden

    isDragging = false
    // reset the page turn flag so dragging a sticker doesn't accidentally trigger a page turn

    activeSticker.addEventListener('dragstart', (e) => {
        e.preventDefault()
        // also prevent the browser drag on the clone itself
    })

    document.addEventListener('mousemove', mouseMove)
    // start tracking mouse movement so the sticker follows the cursor
    document.addEventListener('mouseup', mouseUp)
    // listen for when the user releases the mouse to finish the drag
}

function mouseMove(e) {
    if (!activeSticker) return
    // if nothing is being dragged, do nothing

    newX = startX - e.clientX
    newY = startY - e.clientY
    // calculate how far the mouse moved since the last frame
    // subtracting current from start gives us the movement distance

    startX = e.clientX
    startY = e.clientY
    // update the start position to the current position for the next frame

    activeSticker.style.top = (activeSticker.offsetTop - newY) + 'px'
    activeSticker.style.left = (activeSticker.offsetLeft - newX) + 'px'
    // move the sticker by subtracting the movement distance from its current position
    // + 'px' converts the number into a valid CSS value like "150px"
}

function mouseUp(e) {
    document.removeEventListener('mousemove', mouseMove)
    // stop tracking mouse movement

    // calculate total distance from where the drag originally started
    const totalDragDistance = Math.abs(e.clientX - dragOriginX) + Math.abs(e.clientY - dragOriginY)

    // if the mouse barely moved treat it as an accidental click not a drag
    // stickers return to the panel when dropped outside the book to provide clear feedback
    // that the action was unsuccessful, helping users understand that stickers can only
    // be placed within the book area
    if (totalDragDistance < 5 && activeSticker && !activeSticker.classList.contains('sticker-wrapper')) {
        activeSticker.remove()
        // remove the clone that was created on mousedown
        if (originalSticker) {
            originalSticker.style.visibility = 'visible'
            // restore the original in the panel so the player can try again
        }
        activeSticker = null
        originalSticker = null
        return // exit early, skip the drop detection entirely
    }

    // this entire drop detection section is not covered by the youtube tutorial
    // the following references were used to learn the techniques used here:
    //
    // getBoundingClientRect() to detect element position and check overlap:
    // https://medium.com/@AlexanderObregon/how-getboundingclientrect-works-and-what-it-returns-e67f5b3700cf
    // https://www.w3reference.com/blog/using-getboundingclientrect-to-get-an-element-s-size-and-position/
    //
    // using centre point of dragged element to determine drop position:
    // https://daily-dev-tips.com/posts/vanilla-javascript-drag-n-drop-position/
    // this article uses getBoundingClientRect().height / 2 to find the midpoint of an element
    // the same principle is applied here to find the centre of the sticker
    //
    // checking if a dragged element lands inside a target using coordinate comparison:
    // https://javascript.info/mouse-drag-and-drop

    if (activeSticker) {
        // figure out which page faces are currently visible based on currentLocation
        let possiblePageIds = []

        if (currentLocation === 1) {
            possiblePageIds = ['f1']
            // only the cover is showing
        } else if (currentLocation === 2) {
            possiblePageIds = ['b1', 'f2']
            // back of paper1 and front of paper2 are both visible
        } else if (currentLocation === 3) {
            possiblePageIds = ['b2', 'f3']
            // back of paper2 and front of paper3 are both visible
        } else if (currentLocation === 4) {
            possiblePageIds = ['b3']
            // only the last page is showing
        }

        let dropped = false
        // flag to track whether the sticker was successfully dropped on a page

        possiblePageIds.forEach(pageId => {
            if (dropped) return
            // if the sticker was already successfully dropped on a page, stop checking the rest

            const currentPage = document.querySelector('#' + pageId)
            // find the page element by its id

            if (currentPage) {
                const stickerRect = activeSticker.getBoundingClientRect()
                // get the sticker's current position and size on screen
                const pageRect = currentPage.getBoundingClientRect()
                // get the page's current position and size on screen

                // calculate the centre point of the sticker
                // instead of checking if the whole sticker fits inside the page,
                // we only check if the centre point is inside the page
                // this means stickers near the edge or overlapping two pages still place correctly
                const stickerCentreX = stickerRect.left + stickerRect.width / 2
                // centre x = left edge + half the width
                const stickerCentreY = stickerRect.top + stickerRect.height / 2
                // centre y = top edge + half the height

                // check if the centre point of the sticker is inside the page boundaries
                if (
                    stickerCentreX >= pageRect.left &&   // centre is to the right of the page's left edge
                    stickerCentreX <= pageRect.right &&  // centre is to the left of the page's right edge
                    stickerCentreY >= pageRect.top &&    // centre is below the page's top edge
                    stickerCentreY <= pageRect.bottom    // centre is above the page's bottom edge
                ) {
                    // convert the sticker's screen position into a position relative to the page
                    // so when the page flips, the sticker moves with it
                    const relativeTop = stickerRect.top - pageRect.top
                    const relativeLeft = stickerRect.left - pageRect.left

                    activeSticker.style.top = relativeTop + 'px'
                    activeSticker.style.left = relativeLeft + 'px'
                    // update the sticker's position to the relative values before placing

                    // check if this is already a placed wrapper being re-dragged
                    // or a fresh sticker clone coming from the panel
                    if (activeSticker.classList.contains('sticker-wrapper')) {
            // it's a wrapper being re-placed — just put it back on the page directly
    // do NOT call createStickerWrapper again or it will double wrap and break
    activeSticker.style.position = 'absolute'
    currentPage.appendChild(activeSticker)
    stickerZIndex++
    activeSticker.style.zIndex = stickerZIndex
    // increment the counter so re-placed stickers also sit on top of everything else
    selectWrapper(activeSticker)
    setTimeout(() => {
        activeSticker.dataset.ready = 'true'
    }, 100)
} else {
    // it's a fresh sticker from the panel — wrap it for the first time
    createStickerWrapper(activeSticker, currentPage)
}

                    dropped = true
                    // mark as successfully dropped so the forEach stops checking other pages
                }
            }
        })

        // stickers return to the panel when dropped outside the book to provide clear feedback
        // that the action was unsuccessful, helping users understand that stickers can only
        // be placed within the book area
        if (!dropped) {
            if (activeSticker.classList.contains('sticker-wrapper')) {
                activeSticker.style.position = 'fixed'
            } else {
                activeSticker.remove()
                if (originalSticker) {
                    originalSticker.style.visibility = 'visible'
                    // restoring visibility makes the sticker reappear in its original panel slot
                }
            }
        }
    }

    activeSticker = null
    originalSticker = null
    // reset both references, nothing is being dragged anymore
}


// ============================================================
// PART 3 — STICKER RESIZE
// the resize interaction is built using the same three-event pattern
// taught in these references:
//
// Article: "Making a resizable div in JS is not easy as you think"
// https://medium.com/the-z/making-a-resizable-div-in-js-is-not-easy-as-you-think-bda19a1bc53d
// key idea from this article: attach mousemove and mouseup to the document instead of the handle
// so resizing continues even if the mouse moves outside the handle
//
// Article: "How to Make HTML Elements Resizable Using Pure JavaScript"
// https://www.xjavascript.com/blog/how-to-make-html-element-resizable-using-pure-javascript/
// key idea: record startX, startY and startWidth on mousedown, then calculate delta on mousemove
//
// Article: "Draggable and Resizable Window on your Website"
// https://dev.to/mazhugasergei/-draggable-resizable-window-on-your-website-3b7i
// key idea: mousedown binds mousemove and mouseup, mouseup removes them, same pattern used here
// ============================================================

let selectedWrapper = null
// tracks which placed sticker wrapper is currently selected for resizing

function lockSticker() {
    if (selectedWrapper) {
        selectedWrapper.classList.remove('selected')
        // removing the selected class hides the dashed outline and resize handle via CSS
        selectedWrapper = null
    }
}

// selectWrapper adds the selected class
function selectWrapper(wrapper) {
    if (selectedWrapper && selectedWrapper !== wrapper) {
        lockSticker()
        // if another sticker was already selected, lock it first before selecting the new one
    }
    selectedWrapper = wrapper
    wrapper.classList.add('selected')
    // adding the selected class triggers the dashed outline and shows the resize handle via CSS
}

// clicking anywhere outside the selected wrapper locks it
document.addEventListener('click', (e) => {
    if (selectedWrapper &&
        !selectedWrapper.contains(e.target) &&
        selectedWrapper.dataset.ready === 'true') {
        // dataset.ready prevents locking immediately after placing
        lockSticker()
    }
})

// createStickerWrapper wraps a placed sticker in a div with a resize handle
function createStickerWrapper(stickerImg, parentPage) {
    const size = parseInt(stickerImg.style.width) || 70
    // read the sticker's current width — fall back to 70px if not set

    const wrapper = document.createElement('div')
wrapper.className = 'sticker-wrapper'
wrapper.style.width = size + 'px'
wrapper.style.height = size + 'px'
wrapper.style.top = stickerImg.style.top
wrapper.style.left = stickerImg.style.left
stickerZIndex++
// increment the counter so this sticker sits above all previously placed stickers
wrapper.style.zIndex = stickerZIndex
// each new sticker gets a higher z-index than the one before it
    // make the sticker image fill the wrapper completely
    stickerImg.style.position = 'relative'
    stickerImg.style.width = '100%'
    stickerImg.style.height = '100%'
    stickerImg.style.top = '0'
    stickerImg.style.left = '0'
    stickerImg.style.objectFit = 'contain'
    // contain scales the image to fit without cropping

    // create the resize handle — CSS handles all its appearance
    const handle = document.createElement('div')
    handle.className = 'resize-handle'
    handle.innerHTML = '&#x2921;'
    // ⤡ is the diagonal arrow symbol that signals resize to the player

    // put the sticker and handle inside the wrapper
    wrapper.appendChild(stickerImg)
    wrapper.appendChild(handle)

    // attach the wrapper to the page so the sticker turns with the page when flipped
    parentPage.appendChild(wrapper)

    // clicking the wrapper selects it and shows the resize handle
    wrapper.addEventListener('click', (e) => {
        e.stopPropagation()
        // stopPropagation prevents the document click listener from immediately locking it
        selectWrapper(wrapper)
    })

    // mousedown on the wrapper allows the player to drag the sticker to a new position
    wrapper.addEventListener('mousedown', (e) => {
        if (e.target === handle) return
        // if the player clicked the handle, let the handle's own drag logic handle it
        if (selectedWrapper !== wrapper) return
        // only allow dragging if this wrapper is currently selected

        e.stopPropagation()
        // prevents the book drag from firing at the same time
        isDragging = false
        // reset the page turn flag so this drag doesn't accidentally turn a page

        startX = e.clientX
        startY = e.clientY
        // record where the mouse is at the start of the drag

        const rect = wrapper.getBoundingClientRect()
        // get the wrapper's exact position on screen before detaching it
        document.body.appendChild(wrapper)
        // detach from the page and attach to the body so it can float freely over everything
        wrapper.style.position = 'fixed'
        wrapper.style.left = rect.left + 'px'
        wrapper.style.top = rect.top + 'px'
        wrapper.style.zIndex = 1000
        // place it at its exact screen position so it doesn't visually jump when detached

        activeSticker = wrapper
        // set the wrapper as the active thing being dragged so mouseMove and mouseUp can control it

        document.addEventListener('mousemove', mouseMove)
        document.addEventListener('mouseup', mouseUp)
    })

    // mousedown on the handle starts the resize interaction
    handle.addEventListener('mousedown', (e) => {
        e.stopPropagation()
        // prevents the wrapper mousedown from also firing
        isDragging = false
        // prevent page turning while resizing

        const startMouseX = e.clientX
        const startMouseY = e.clientY
        // record where the mouse was when the resize started
        const startSize = wrapper.offsetWidth
        // record the wrapper's current size as the starting point for the calculation

        function onResizeMove(e) {
            const dx = e.clientX - startMouseX
            const dy = e.clientY - startMouseY
            // calculate how far the mouse moved horizontally and vertically since the resize started

            const delta = (dx + dy) / 2
            // average the two directions to get one proportional resize value
            // dragging down-right makes it bigger, up left makes it smaller

            const newSize = Math.min(500, Math.max(10, startSize + delta))
            // clamp the new size between 10px minimum and 500px maximum
            // Math.max prevents it going below 10, Math.min prevents it going above 500

            wrapper.style.width = newSize + 'px'
            wrapper.style.height = newSize + 'px'
            // because the sticker uses width: 100% and height: 100%
        }

        function onResizeUp() {
            document.removeEventListener('mousemove', onResizeMove)
            document.removeEventListener('mouseup', onResizeUp)
            // clean up both listeners when the player releases the handle
            // without this they would keep running in the background forever
        }

        document.addEventListener('mousemove', onResizeMove)
        // track mouse movement during resize
        document.addEventListener('mouseup', onResizeUp)
        // listen for when the player releases the handle to stop resizing
    })

    selectWrapper(wrapper)
    // immediately select the wrapper after placing so the outline and handle appear right away

    setTimeout(() => {
        wrapper.dataset.ready = 'true'
    }, 100)
    // after 100ms mark the wrapper as ready
    // this small delay prevents the mouseup from the drop immediately triggering the click-to-lock listener

    return wrapper
}