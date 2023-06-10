const mine = `<img class='hidden' id='mine' src='https://www.giantbomb.com/a/uploads/scale_medium/8/87790/3216800-icon_mine.png' height='70vmin'>`
const PICTURES = {
    null: '',
    mine: mine,
    1: `<p class='hidden numbers'>1</p>`,
    2: `<p class='hidden numbers'>2</p>`,
    3: `<p class='hidden numbers'>3</p>`,
    4: `<p class='hidden numbers'>4</p>`,
    5: `<p class='hidden numbers'>5</p>`,
    6: `<p class='hidden numbers'>6</p>`,
    7: `<p class='hidden numbers'>7</p>`,
    8: `<p class='hidden numbers'>8</p>`,
}

const lightGrey = 'rgb(0, 122, 122)';

let board;
let clickedSquareIndexes;
let bombLocations;
let state;
let choiceOfItem;
let firstClickLocation;
let firstMineLocation;
let beenChecked;

///Cached elements
const reset = document.getElementById('reset')
const boardLayout = document.getElementById('boardLayout')
const message = document.querySelector('h2')
const boxStyle = document.querySelector('.box')
const choiceShovelDiv = document.getElementById('choiceShovel')
const choiceFlagDiv = document.getElementById('choiceFlag')

//// Event listeners
reset.addEventListener('click', init)
boardLayout.addEventListener('click', handleClickChoice)
choiceShovelDiv.addEventListener('click', handleShovelClick)
choiceFlagDiv.addEventListener('click', handleFlagClick)


    
////////FUNCTIONS


init()

function init(){
counter = 0;
board = [
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
]
state = 'playing'
document.querySelectorAll('.box').forEach(e => e.style.backgroundColor = 'gray')
message.innerText = 'Avoid digging the hidden mines!'
clickedSquareIndexes = [];
choiceOfItem = 'shovel';
firstClickLocation = [];
beenChecked = [];
render()
}

function render(){
    renderBoard()
    //Resets border around shovel/flag if left on flag
    renderItemIcon()
}


function renderBoard(){
    handleBombLocations()
    for(let i = 0; i <= board.flat().length - 1; i++){
      let boardLocations = document.querySelector(`#boardLayout :nth-child(${i + 1})`)
        boardLocations.innerHTML = PICTURES[board.flat()[i]]
    }
}


function renderItemIcon(){
    choiceFlagDiv.classList.remove('notChoice')
    choiceFlagDiv.classList.remove('currentChoice')
    choiceShovelDiv.classList.remove('notChoice')
    choiceShovelDiv.classList.remove('currentChoice')
    if(choiceOfItem === 'shovel'){
        choiceFlagDiv.classList.add('notChoice')
        choiceShovelDiv.classList.add('currentChoice')
    } else if (choiceOfItem === 'flag'){
        choiceShovelDiv.classList.add('notChoice')
        choiceFlagDiv.classList.add('currentChoice')
    }

}


function handleClickChoice(e){
    if(choiceOfItem === 'shovel'){
         handleClickShovel(e) 
    } else if(choiceOfItem === 'flag') { 
        handleClickFlag(e)
    }
}



function handleClickShovel(e){
    let choiceId = e.target
    if(choiceId.id === 'boardLayout') return
    if(state === 'loss' || state === 'winner') return
    if(choiceId.src === 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Minesweeper_flag.svg/2048px-Minesweeper_flag.svg.png') return
    if(choiceOfItem === 'flag') return
    /// If a bomb is chosen on the first turn, the board is rerendered and then the target is changed to match the target of that current location now
    if(choiceId.id === 'mine' && firstClickLocation.length < 1 || board.flat()[choiceId.id] !== null && firstClickLocation < 1){
        console.log('happening')
        firstMineLocation = choiceId.parentNode.id
        render()
        choiceId = document.getElementById(firstMineLocation)
        ///// This while loops makes the board rerender until you can get a flood start, also prevents rendering a bomb under you twice
        while(board.flat()[choiceId.id] !== null){
            render()
        }
        console.log(choiceId, 'THIS IS WHAT MATTERS', firstMineLocation, choiceId.parentNode.id, board.flat()[choiceId.id])
    }





    firstClickLocation = choiceId.parentNode.id
    choiceId.classList.remove('hidden');
    choiceId.style.backgroundColor = lightGrey;
    
    //// If a shovel hits a mine
    if(choiceId.id === 'mine'){
        state = 'loss'
        choiceId.style.backgroundColor = 'gray';
        console.log(choiceId)
        handleMessage(choiceId)
    }

    /// If a shovel hits a blank space
    // When clicked the second time, after a bomb hit. You can have a div with a 'numberTwo' or any number class. In this case, the number value has to be added
    // to that div's innerText, ALSO handleNULL cannot be called because it will cause random null spaces to be linked to this numbered div to 'flood'
   if(choiceId.tagName === 'DIV' && choiceId.classList[1] !== undefined){
            //// Guard clause prevents clicking on a 'P' element once it has been autofilled
             if(clickedSquareIndexes.indexOf(Number(choiceId.id)) > -1) return
        choiceId.innerText = board.flat()[firstMineLocation]  
    } else if(choiceId.tagName === 'DIV'){
        handleNULL(choiceId)
        if(clickedSquareIndexes.indexOf(Number(choiceId.id)) < 0){
            clickedSquareIndexes.push(Number(choiceId.id))
        }
        
    } 

    /// If a shovel hits a number space
    if(choiceId.tagName === 'P'){
        choiceId.style.backgroundColor = lightGrey;
        if(clickedSquareIndexes.indexOf(Number(choiceId.parentNode.id)) < 0){
            clickedSquareIndexes.push(Number(choiceId.parentNode.id))
        }
    }
    /// If the clicked space results in the 20 nonmine spaces being clicked
    if(clickedSquareIndexes.length === 85) {
        state = 'winner'
        handleWin()
    }
    }


function handleClickFlag(e){
    if(state === 'loss' || state === 'winner') return
    if(choiceOfItem === 'shovel') return
    /// Handles unclick of flag
    if(e.target.src === 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Minesweeper_flag.svg/2048px-Minesweeper_flag.svg.png'){
        if(e.target.id === 'mine'){
            e.target.src = 'https://www.giantbomb.com/a/uploads/scale_medium/8/87790/3216800-icon_mine.png'
            e.target.classList.add('hidden')
            return
        } else if (e.target.id === 'number') {
                // attaches to the parentNode (e.target's classList which stores the old value for that square (ex: 2), PICTURES uses that value to replace the lost html)
            e.target.parentNode.innerHTML = PICTURES[e.target.classList[0]]
            return
        } else if (e.target.classList[0] === 'box'){
            e.target.parentNode.innerHTML =  `<div id=${e.target.id} class="box" style='background-color:gray;'></div>`
            return
        }
}

/// Handles first click
if(e.target.style.backgroundColor === lightGrey) return //// if it has already been clicked before
        /// if first click on img
    e.target.classList.remove('hidden');
    e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Minesweeper_flag.svg/2048px-Minesweeper_flag.svg.png'
        /// if first click on number and then first click on blank space
    if(e.target.tagName === 'P'){
        e.target.parentNode.innerHTML = `<img id='number' class='${e.target.innerText}'src='https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Minesweeper_flag.svg/2048px-Minesweeper_flag.svg.png' height='70vmin'>`
    } else if (e.target.tagName === 'DIV' && e.target.style.backgroundColor === 'gray'){
        e.target.innerHTML = `<img id='${e.target.id}' class='${e.target.classList[0]}'src='https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Minesweeper_flag.svg/2048px-Minesweeper_flag.svg.png' >`
    }
    }


function handleLoss(currentMine){
message.innerText = 'You Lose!'
/// Reveals bombs after loss, then adds animation to clicked
document.querySelectorAll('.hidden').forEach(e => e.classList.remove('hidden'))
currentMine.classList.add('bombAction')
setTimeout(() => document.querySelectorAll('#mine').forEach(e => e.src = 'https://www.freepnglogos.com/uploads/explosion/clipart-starburst-explosion-comic-vector-png-transparent-5.png'), 1000)
}


function handleWin(){
message.innerText = 'You win!'
}



function handleMessage(id){
    if(state === 'playing') return
    if(state === 'winner') handleWin()
    if(state === 'loss') handleLoss(id)
}

/// Changes item to shovel and renders box around it
function handleShovelClick(){
choiceOfItem = 'shovel'
renderItemIcon()
}
/// Changes item to flag and renders box around it
function handleFlagClick(){
choiceOfItem = 'flag'
renderItemIcon()
}


function getBombLocations(){
bombLocations = []
    while(bombLocations.length < 15){
        let rando = Math.floor(Math.random() * 100)
    if(!bombLocations.includes(rando) && rando !== firstMineLocation - 1){
        bombLocations.push(rando)
    }
}
}


function elementChangeFill (currentElem, newBoard, indexForNewBoard) {
    currentElem.style.backgroundColor = lightGrey
    currentElem.classList.remove('hidden');
    currentElem.innerText = newBoard[indexForNewBoard]
}

function pushClickSquare(indexForNewBoard){
    if(clickedSquareIndexes.indexOf(indexForNewBoard) < 0){
        clickedSquareIndexes.push(Number(indexForNewBoard))
    }
}




function handleNULL(e) {
    let newBoard = board.flat()
    let idx = Number(e.id) > -1 ? Number(e.id) : e

///
beenChecked.push(idx)
///

    if(clickedSquareIndexes.indexOf(idx) < 0){
        clickedSquareIndexes.push(idx)
    }

let rightSideNums = [99, 89, 79, 69, 59, 49, 39, 29, 19, 9]
let leftSideNums = [90, 80, 70, 60, 50, 40, 30, 20, 10, 0]


//Left fill
for(let i = 1; i < newBoard.length; i++){
    let indexForNewBoard = idx - i 
    let currentElem = document.getElementById(`${indexForNewBoard}`)

if(typeof(newBoard[indexForNewBoard]) === 'number' && rightSideNums.indexOf(indexForNewBoard) < 0){
    elementChangeFill(currentElem, newBoard, indexForNewBoard)
    pushClickSquare(indexForNewBoard)
break;
} else if(newBoard[indexForNewBoard] !== null || rightSideNums.indexOf(indexForNewBoard) > -1 || idx - 1 < 0){
break;
} else {
    document.getElementById(`${indexForNewBoard}`).style.backgroundColor = lightGrey
    pushClickSquare(indexForNewBoard)
}
}

// Right fill

    /// i equals 0 to skip the actual clicked on element
    for(let i = 1; i < newBoard.length; i++){
        let indexForNewBoard = idx + i
        let currentElem = document.getElementById(`${indexForNewBoard}`)

        if(typeof(newBoard[indexForNewBoard]) === 'number' && leftSideNums.indexOf(indexForNewBoard) < 0){
            elementChangeFill(currentElem, newBoard, indexForNewBoard)
            pushClickSquare(indexForNewBoard)
            break;
        /// This makes the cleaning stop if it reaches a mine || if it reaches a leftSideNums index
        } else if(newBoard[indexForNewBoard] !== null || leftSideNums.indexOf(indexForNewBoard) > -1){
                break;
        }
        /// This makes the null tiles clear
         else {
            document.getElementById(`${indexForNewBoard}`).style.backgroundColor = lightGrey
            pushClickSquare(indexForNewBoard)
        }

}


///Have to subtract one everywhere but when getting element because id of elements are not zero indexed whereas the newBoard is
//Top fill  


for(let i = 1; i < 10; i++){
    let indexForNewBoard = idx - (10 * i)
    let currentElem = document.getElementById(`${indexForNewBoard}`)
       
       if(typeof(newBoard[indexForNewBoard]) === 'number'){
           elementChangeFill(currentElem, newBoard, indexForNewBoard)
           pushClickSquare(indexForNewBoard)
           break;
       } else if(newBoard[indexForNewBoard] !== null){
       break;
       } else if (newBoard[indexForNewBoard] === null){
           currentElem.style.backgroundColor = lightGrey
           pushClickSquare(indexForNewBoard)
       }
   
   }


//Top Right fill
for(let i = 1; i < 10; i++){
    let indexForNewBoard = idx - (10 * i) + i
    let currentElem = document.getElementById(`${indexForNewBoard}`)
    
     /// Should not even try to check to the right if on the edge
     if(rightSideNums.indexOf(idx) > -1 || leftSideNums.indexOf(indexForNewBoard) > -1){
        break;
    }
    
    
        if(typeof(newBoard[indexForNewBoard]) === 'number' && leftSideNums.indexOf(indexForNewBoard) < 0){
            elementChangeFill(currentElem, newBoard, indexForNewBoard)
            pushClickSquare(indexForNewBoard)
            break;
        } else if(newBoard[idx - (10 * i)] !== null  || rightSideNums.indexOf(idx) > -1){
        break;
        } else if (newBoard[idx - (10 * i)] === null){
            currentElem.style.backgroundColor = lightGrey
            pushClickSquare(indexForNewBoard)
        }
    
    }
    





//Top left fill
for(let i = 1; i < 10; i++){
    let indexForNewBoard = idx - (10 * i) - i
    let currentElem = document.getElementById(`${indexForNewBoard}`)
    
     /// Should not even try to check to the right if on the edge
     if(leftSideNums.indexOf(idx) > -1 || rightSideNums.indexOf(indexForNewBoard) > -1){
    break;
    }
    
    
    if(typeof(newBoard[indexForNewBoard]) === 'number' && rightSideNums.indexOf(indexForNewBoard) < 0){
        elementChangeFill(currentElem, newBoard, indexForNewBoard)
            pushClickSquare(indexForNewBoard)
        break;
    } else if(newBoard[indexForNewBoard] !== null || leftSideNums.indexOf(idx) > -1){
        break;
    } else if (newBoard[indexForNewBoard] === null){
            currentElem.style.backgroundColor = lightGrey
            pushClickSquare(indexForNewBoard)
        }
    
    }





//Bottom fill
for(let i = 1; i < 10; i++){
    let indexForNewBoard = idx + (10 * i);
    let currentElem = document.getElementById(`${indexForNewBoard}`)
    
    if(typeof(newBoard[indexForNewBoard]) === 'number'){
        elementChangeFill(currentElem, newBoard, indexForNewBoard)
        pushClickSquare(indexForNewBoard)
        break;
    } else if(newBoard[indexForNewBoard] !== null){
        break;
    } else if (newBoard[indexForNewBoard] === null){
        currentElem.style.backgroundColor = lightGrey
        pushClickSquare(indexForNewBoard)
        }
    }
    


//Bottom Left Dia fill
for(let i = 1; i < 10; i++){
    let indexForNewBoard = idx + (10 * i) - i
    let currentElem = document.getElementById(`${indexForNewBoard}`)

    /// Should not even try to check to the right if on the edge
        if(leftSideNums.indexOf(idx) > -1 || rightSideNums.indexOf(indexForNewBoard) > -1){
     break;
    }


    if(typeof(newBoard[indexForNewBoard]) === 'number' && rightSideNums.indexOf(indexForNewBoard) < 0){
        elementChangeFill(currentElem, newBoard, indexForNewBoard)
        pushClickSquare(indexForNewBoard)
        break;
    } else if(newBoard[indexForNewBoard] !== null || leftSideNums.indexOf(idx) > -1){
    break;
    } else if (newBoard[indexForNewBoard] === null){
        currentElem.style.backgroundColor = lightGrey
        pushClickSquare(indexForNewBoard)
    }
}


//Bottom Right Dia fill
for(let i = 1; i < 10; i++){
    let indexForNewBoard = idx + (10 * i) + i
    let currentElem = document.getElementById(`${indexForNewBoard}`)

    /// Should not even try to check to the right if on the edge
    if(rightSideNums.indexOf(idx) > -1 || leftSideNums.indexOf(indexForNewBoard) > -1){
        break;
    }


    if(typeof(newBoard[indexForNewBoard]) === 'number' && leftSideNums.indexOf(indexForNewBoard) < 0){
        elementChangeFill(currentElem, newBoard, indexForNewBoard)
        pushClickSquare(indexForNewBoard)
        break;
    } else if(newBoard[indexForNewBoard] !== null || rightSideNums.indexOf(idx) > -1){
    break;
    } else if (newBoard[indexForNewBoard] === null ){
        currentElem.style.backgroundColor = lightGrey
        pushClickSquare(indexForNewBoard)
    }
}




/// If the win occurs on a fill
if(clickedSquareIndexes.length >= 85) {
    state = 'winner'
    handleWin()
}

/// recursive handleNULL function

for(let i=0; i < clickedSquareIndexes.length; i++){
    console.log(beenChecked, 'beenChecked')
    console.log(newBoard[clickedSquareIndexes[i]] === null, beenChecked.indexOf(clickedSquareIndexes[i]), clickedSquareIndexes[i])
    if(newBoard[clickedSquareIndexes[i]] === null && beenChecked.indexOf(clickedSquareIndexes[i]) < 0){
        handleNULL(clickedSquareIndexes[i])
    }

}
}


function handleBombLocations(){
getBombLocations()

/// board is redeclared here in case of a bomb on first click. Automatically allows a redo on the board organization to avoid 10 bombs
board = [
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
]

let newBoard = board.flat()
let final = [];
let innerArr = [];

bombLocations.forEach(e => newBoard[e] = 'mine')

while(newBoard.length){
    innerArr.push(newBoard.shift())
    // console.log(innerArr)
    if(innerArr.length === 10){
        final.push(innerArr)
        innerArr = []
    }
}

board = final


for(let i = 0; i< board.length; i++){
    for(let j = 0; j< board.length; j++){

        //// clickedSquareIndexes of Mine
    if(board[i][j] === 'mine' && j > 0){
        if(board[i][j - 1] !== 'mine'){
            if(board[i][j - 1] === null){
                board[i][j - 1] = 1
            } else {
                board[i][j - 1]++
            }
        }

    }

        /// Right of Mine
    if(board[i][j] === 'mine' && j < 9){
        if(board[i][j + 1] !== 'mine'){
            if(board[i][j + 1] === null){
                board[i][j + 1] = 1
            } else {
                board[i][j + 1]++
            }
        }

    }

    //     /// Top of Mine
    if(board[i][j] === 'mine' && i > 0){
            if(board[i - 1][j] !== 'mine'){
                if(board[i - 1][j] === null){
                    board[i - 1][j] = 1
                } else {
                    board[i - 1][j]++
                }
            }
    
    }

    // /// Right Top Dia
    if(board[i][j] === 'mine' && i > 0 && j < 9){
        if(board[i - 1][j + 1] !== 'mine'){
            if(board[i - 1][j + 1] === null){
                board[i - 1][j + 1] = 1
            } else {
                board[i - 1][j + 1]++
            }
        }
    }

    //  /// Right clickedSquareIndexes Dia
     if(board[i][j] === 'mine' && i > 0 && j > 0){
        if(board[i - 1][j - 1] !== 'mine'){
            if(board[i - 1][j - 1] === null){
                board[i - 1][j - 1] = 1
            } else {
                board[i - 1][j - 1]++
            }
        }
    }

    //  /// Below Mine
     if(board[i][j] === 'mine' && i < 9){
        if(board[i + 1][j] !== 'mine'){
            if(board[i + 1][j] === null){
                board[i + 1][j] = 1
            } else {
                board[i + 1][j]++
            }
        }

    // /// Below Mine Right
    if(board[i][j] === 'mine' && i < 9 && j < 9){
        if(board[i + 1][j + 1] !== 'mine'){
            if(board[i + 1][j + 1] === null){
                board[i + 1][j + 1] = 1
            } else {
                board[i + 1][j + 1]++
            }
        }
    }

    // // /// Below Mine clickedSquareIndexes
    if(board[i][j] === 'mine' && i < 9 && j > 0){
        if(board[i + 1][j - 1] !== 'mine'){
            if(board[i + 1][j - 1] === null){
                board[i + 1][j - 1] = 1
            } else {
                board[i + 1][j - 1]++
            }
        }
    }

   
}
    
  
}
}
renderNumberColor(board.flat())
}


function renderNumberColor(flattenedBoard){
    /// Clears old classlist
    for(let i = 0; i< flattenedBoard.length; i++){
        if(flattenedBoard[i] || flattenedBoard[i]=== null){
            document.getElementById(i).classList.remove('numberOne')
            document.getElementById(i).classList.remove('numberTwo')
            document.getElementById(i).classList.remove('numberThree')
            document.getElementById(i).classList.remove('numberFour')
            document.getElementById(i).classList.remove('numberFive')
            document.getElementById(i).classList.remove('numberSix')
            document.getElementById(i).classList.remove('numberSeven')
            document.getElementById(i).classList.remove('numberEight')
            }
    }
    
    /// Adds color based on numbers
    for(let i = 0; i < flattenedBoard.length; i++){
        if(flattenedBoard[i] === 1){
            document.getElementById(i).classList.add('numberOne')
        }
        if(flattenedBoard[i] === 2){
            document.getElementById(i).classList.add('numberTwo')
        }
        if(flattenedBoard[i] === 3){
            document.getElementById(i).classList.add('numberThree')
        }
        if(flattenedBoard[i] === 4){
            document.getElementById(i).classList.add('numberFour')
        }
        if(flattenedBoard[i] === 5){
            document.getElementById(i).classList.add('numberFive')
        }
        if(flattenedBoard[i] === 6){
            document.getElementById(i).classList.add('numberSix')
        }
        if(flattenedBoard[i] === 7){
            document.getElementById(i).classList.add('numberSeven')
        }
        if(flattenedBoard[i] === 8){
            document.getElementById(i).classList.add('numberEight')
        }

    }

    

}