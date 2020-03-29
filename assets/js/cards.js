// ---------------- MASTER VARIABLES

var isGrabbed = false

var cardsSelector = ".card-list-container ul.card-list >.content li.card"
var possibleDropList = $("ul.card-list > .content")

var previousPos

//  MOUSE VARIABLES
var holdMouseClick

var mousex = 0
var mousey = 0

//  CARD VARIABLES
var grabbedCard

//  LIST VARIABLES
var defaultList

// ---------------- MASTER FUNCTIONS

// LIMITS TO CLONE CONTROLS
function onLimitsX() {
    var width = parseInt($(cardsSelector).css("width")) / 2

    if (mousex - width < 0 || mousex + width > window.innerWidth)
        return false

    return true
}

function onLimitsY() {
    var height = parseInt($(cardsSelector).css("height")) / 2

    if (mousey - height < 0 || mousey + height > window.innerHeight - 20)
        return false

    return true
}

//  VERIF DROP POSITION AND LIST
function verifDrop() {
    var selectedList = verifList()

    organizeList(selectedList)
}

//  VERIF WHAT LIST TO DROP
function verifList() {
    var selectedList

    //  VERIF WHAT LIST TO DROP
    $(possibleDropList).each((index, element) => {
        if ($(element).offset().left < mousex)
            selectedList = $(element)
    })

    //  IF IS ON LEFT OF ALL LISTS
    if (selectedList == undefined)
        selectedList = $(possibleDropList)[0]

    return selectedList
}

//  VERIF WHAT POSITION TO DROP ON LIST
function verifPos(list) {
    //  ALL ITEMS ON SELECTED LIST EXCEPT THE GRABBED ONE
    var items = $(list).find('.card:not(.isgrabbed)')

    //items.splice(items.indexOf(grabbedCard))

    //  ITEM MARGIN
    var itemMargin = parseInt($(items).css("height")) / 2

    //  FINAL LIST
    var finalList = []

    //  CLONE IS ADDED TO LIST
    var cloneIsOnList = false


    $(items).each((index, element) => {
        //  IF BEFORE THE MOUSE POSITION ON LIST
        if ($(element).offset().top + itemMargin < mousey)
            finalList.push(element)

        //  ELSE
        else {
            //  IF CLONE NOT ADDED ON FINAL LIST YET
            if (!cloneIsOnList) {
                finalList.push(grabbedCard)
                finalList.push(element)
                cloneIsOnList = true
            }
            //  ELSE
            else
                finalList.push(element)
        }
    })

    //  IF CLONE IS ON BOTTOM OF LIST
    if (!cloneIsOnList)
        finalList.push(grabbedCard)

    return finalList
}

function organizeList(list, first = false) {
    list = list[0]

    var changedList = false

    var animSpeed = 100

    if (first)
        animSpeed = 0

    //  IF CHANGE LIST
    if (list != defaultList[0]) {
        var previousList = verifPos(defaultList[0])

        $(previousList).each((index, element) => {
            if (element != grabbedCard) {
                $(element).animate({
                    top: "0px"
                }, animSpeed)
            }
        })

        defaultList[0] = list

        changedList = true
    }

    var finalList = verifPos(verifList())

    //  IF CHANGE POS
    if (previousPos != finalList.indexOf(grabbedCard) || changedList) {
        previousPos = finalList.indexOf(grabbedCard)

        var listMargin = $(".card-list-container .card-list > .content").offset().top

        var grabbedMargin = listMargin

        $(finalList).each((index, element) => {
            //  BEFORE CLONE
            if (index < finalList.indexOf(grabbedCard)) {
                grabbedMargin += parseInt($(element).css("height")) + parseInt($(element).css("margin-bottom"))
                $(element).animate({
                    top: `0px`
                }, animSpeed)
            }

            //  CLONE
            else if (index == finalList.indexOf(grabbedCard)) {
                $(element).animate({
                    top: `${grabbedMargin}px`
                }, animSpeed)
            }

            //  AFTER CLONE
            else {
                var mtop = parseInt($(grabbedCard).css("height")) + parseInt($(grabbedCard).css("margin-bottom"))

                $(element).animate({
                    top: `${mtop}px`
                }, animSpeed)
            }
        })
    }

    //  CLEAR LIST
    $(list).html("")

    //  FILL LIST WITH ORGANIZED ITEMS    
    $(finalList).each((index, element) => {
        $(list).append(element)
    })
}

//  CLONE CONTROLS
function createClone(e, card) {
    mousex = e.clientX
    mousey = e.clientY

    var clone = card[0].cloneNode(true)

    $(clone).addClass("clone")

    $(clone).css("position", "absolute")

    var posx = mousex - parseInt($(card).css("width")) / 2
    var posy = mousey - parseInt($(card).css("height")) / 2

    $(clone).css("left", `${posx}px`)
    $(clone).css("top", `${posy}px`)

    return clone
}

function removeClone() {
    $("body").find(".card.clone").remove()
}

function moveClone(e) {
    mousex = e.clientX
    mousey = e.clientY

    var clone = $("body").find(".card.clone")

    var posx = mousex - parseInt($(clone).css("width")) / 2
    var posy = mousey - parseInt($(clone).css("height")) / 2

    if (onLimitsX())
        $(clone).css("left", posx);

    if (onLimitsY())
        $(clone).css("top", posy);

    verifDrop()
}

//  CARD CONTROLS
function grabCard(e, card) {
    if (!isGrabbed) {
        mousex = e.clientX
        mousey = e.cientY

        defaultList = $(card).closest(".content")

        isGrabbed = true

        var clone = createClone(e, card)

        $(clone).addClass("clone")

        $(card).addClass("isgrabbed")

        grabbedCard = card

        $(".card-list-container").append(clone)

        organizeList(defaultList, true)
    }
}

//  DROP CARD ON POSITION
function dropCard() {
    $(grabbedCard).removeClass("isgrabbed")


    $(defaultList).find(".card").each((index, element) => {
        $(element).css("top", "")

        setTimeout(() => {
            $(element).animate({
                top: ""
            })
        }, 100)
    })

}

function clickCard(target) {
    $(".clicked").removeClass("clicked")
    $(target).addClass("clicked")
}

// ---------------- EVENTS

//  ON HOLD MOUSE
$(document).on("mousedown", cardsSelector, (e) => {
    var secs = 200

    var card = $(e.target).closest(".card")

    holdMouseClick = setTimeout(() => {
        clearTimeout(holdMouseClick)
        grabCard(e, card)
    }, secs)

    //  IF MOUSE LEAVES THE CARD
    $(e.target).on("mouseleave", (e) => {
        if (isGrabbed) {
            clearTimeout(holdMouseClick)
            grabCard(e, card)
        }
    })

})

//  ON MOVE HOLDED
$(document).on("mousemove", (e) => {
    if (isGrabbed)
        moveClone(e)
})

//  STOP HOLDING
$(document).on("mouseup", (e) => {
    clearTimeout(holdMouseClick)

    var card = $(e.target).closest('.card')

    console.log(card)

    var clickedOnCard = $(cardsSelector).toArray().some((value) => { return value == card[0] })

    if (isGrabbed)
        dropCard()
    else {
        if (clickedOnCard)
            clickCard(card)
    }

    removeClone()

    isGrabbed = false

})