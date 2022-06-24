const jug = document.querySelector('.jug');
const rune = document.querySelector('.rune');
const counter = document.querySelector('.runRune');
const chest = document.querySelector('.counter');
const time = document.querySelector('.timer_time');
const timerButton = document.querySelector('.start_button');
const start = document.querySelector('.start');
const modal = document.querySelector('.modal');
const modalWin = document.querySelector('.modal_window');
const score = document.querySelector('.best-score');
const modalText = document.querySelectorAll('.modal_text');
const modalButtons = document.querySelectorAll('.modal_button');
const sound = document.querySelectorAll('.sound');
const steps = document.querySelectorAll('.steps');

//volume change
steps.forEach(el => el.volume = 0.05);
sound.forEach(s => s.volume = 0.3);
//cp pickup volume
sound[2].volume = 0.1;
//set saved best score
if (localStorage.getItem('best') === null) {
    localStorage.setItem('best', '0')
}
score.innerHTML = `Лучший результат: ${localStorage.getItem('best')} рун`;

const player = {
    runes: {
        amount: 0,
        step: [20, 40, 55, 75],
        add: () => player.runes.amount += 1,
        reset: () => {
            player.runes.amount = 0; 
            counter.dataset.text = player.runes.amount;
        }
    },
    pos: {
        row: 4,
        col: 1
    },
    resetPos: () => {
        player.pos.row = 4;
        player.pos.col = 1;
        jug.style.top = `calc(85px * ${player.pos.row})`;
        jug.style.left = `calc(85px * ${player.pos.col})`;
    }
};
const target = {
    pos: {
        row: 1,
        col: 4
    },
    resetPos: () => {
        target.pos.row = 1;
        target.pos.col = 4;
        rune.style.top = `calc(85px * ${target.pos.row})`;
        rune.style.left = `calc(85px * ${target.pos.col})`;
    }
};
//chest scale...?
let chestScale = 5 / 10;
//step sound counter
let jugSteps = 0;

function playStepSound() {
    //footsteps sounds
    steps[jugSteps].play();

    if (jugSteps > steps.length - 2) {
        //reset counter if it exceed array length
        jugSteps = 0;
    } else {
        jugSteps += 1;
    };
}

document.addEventListener('keydown', moveJug);
function moveJug(key) {
    //arrow keys
    [up, down, left, right] = [38, 40, 37, 39];

    //check which key is pressed and if it's an end of the grid
    if (key.keyCode === up && jug.style.top !== 'calc(0px)') {
        //count position
        player.pos.row -= 1;
        jug.style.top = `calc(85px * ${player.pos.row})`;
        playStepSound();
    };
    if (key.keyCode === down && jug.style.top !== 'calc(425px)') {
        player.pos.row += 1;
        jug.style.top = `calc(85px * ${player.pos.row})`;
        playStepSound();
    };
    if (key.keyCode === left && jug.style.left !== 'calc(0px)') {
        player.pos.col -= 1;
        jug.style.left = `calc(85px * ${player.pos.col})`;
        playStepSound();
    };
    if (key.keyCode === right && jug.style.left !== 'calc(425px)') {
        player.pos.col += 1;
        jug.style.left = `calc(85px * ${player.pos.col})`;
        playStepSound();
    }

    //when player is stepped on rune
    if (player.pos.row === target.pos.row && player.pos.col === target.pos.col) {
        //stop player so that rune can't be abused by fast in/out move
        document.removeEventListener('keydown', moveJug);
        //toggle disappear effect
        rune.classList.toggle('puff');
        //count grabbed runes
        player.runes.add();
        //display number of grabbed runes
        counter.dataset.text = player.runes.amount;

        //change size of a chest for animation
        chestScale = ((chestScale * 10) + 4) / 10;
        chest.style.transform = `scale(${chestScale})`;

        setTimeout(() => {
            if (player.runes.step[0] === player.runes.amount || player.runes.step[1] === player.runes.amount || player.runes.step[2] === player.runes.amount || player.runes.step[3] === player.runes.amount) {
                //play rune pickup sound
                sound[2].load();
                sound[2].play();
                //scale base by 0.2 on different steps [20, 40, 55, 75]
                chestScale = ((chestScale * 10) - 3) / 10;
            } else {
                sound[1].load();
                sound[1].play();
                //scale back to base
                chestScale = ((chestScale * 10) - 4) / 10;
            };
            if (player.runes.step[3] === player.runes.amount) {
                //if runes amount is 75
                sound[0].play()
            };
            chest.style.transform = `scale(${chestScale})`;

            //random the position of the next rune
            while (player.pos.row === target.pos.row && player.pos.col === target.pos.col) {
                //random rune position while it won't be the same as player... Need to rework it <<<
                target.pos = {
                    row: Math.round(Math.random() * 5),
                    col: Math.round(Math.random() * 5)
                };
            };
            rune.style.top = `calc(85px * ${target.pos.row})`;
            rune.style.left = `calc(85px * ${target.pos.col})`;
        }, 100);
        setTimeout(() => {
            //toggle disappear effect again
            rune.classList.toggle('puff');
        }, 300);
        setTimeout(() => {
            //give back ability to move
            document.addEventListener('keydown', moveJug);
        }, 400);
    };
}

// Timer
class CountDownTimer {
    constructor (duration, granularity) {
        this.duration = duration;
        this.granularity = granularity || 1000;
        this.tickFtns = [];
        this.running = false;

        CountDownTimer.prototype.start = function() {
            if (this.running) {
              return;
            }
            this.running = true;
            let start = Date.now(),
                that = this,
                diff, obj;
          
            (function timer() {
            diff = that.duration - (((Date.now() - start) / 1000) | 0);
        
            if (diff > 0) {
                setTimeout(timer, that.granularity);
            } else {
                diff = 0;
                that.running = false;

                setTimeout(() => {
                    //open modal window
                    modal.classList.toggle('show');
                    modalWin.classList.toggle('show');
                    //stop player
                    //doesn't work sometimes, don't know why// need to rework it <<< 
                    document.removeEventListener('keydown', moveJug);

                    //store best score
                    if (localStorage.getItem('best') < player.runes.amount) {
                        localStorage.setItem('best', player.runes.amount)
                        //display if it's a new best score
                        modalText[0].innerHTML = `Текущий результат: ${player.runes.amount} рун`;
                        modalText[1].innerHTML = `<span class="highlight">Новый</span> Лучший результат: ${localStorage.getItem('best')} рун`;
                    } else {
                        modalText[0].innerHTML = `Текущий результат: ${player.runes.amount} рун`;
                        modalText[1].innerHTML = `Лучший результат: ${localStorage.getItem('best')} рун`;
                    }
                    score.innerHTML = `Лучший результат: ${localStorage.getItem('best')} рун`;
                }, 300)
            };
          
            obj = CountDownTimer.parse(diff);
            that.tickFtns.forEach(function(ftn) {
                ftn.call(this, obj.minutes, obj.seconds);
            }, that);
            }());
        };
          
        CountDownTimer.prototype.onTick = function(ftn) {
            if (typeof ftn === 'function') {
              this.tickFtns.push(ftn);
            }
            return this;
        };
          
        CountDownTimer.prototype.expired = function() {
            return !this.running;
        };
          
        CountDownTimer.parse = function(seconds) {
            return {
              'minutes': (seconds / 60) | 0,
              'seconds': (seconds % 60) | 0
            };
        };
    }
}

let timer = new CountDownTimer(90),
timeObj = CountDownTimer.parse(90);

format(timeObj.minutes, timeObj.seconds);

timer.onTick(format);

timerButton.addEventListener('click', startTimer);
function startTimer() {   
    //stop listen start button
    timerButton.removeEventListener('click', startTimer);
    //stop player
    document.removeEventListener('keydown', moveJug);

    //reset player position
    player.resetPos();
    //reset rune position
    target.resetPos();
    //reset rune counter
    player.runes.reset();
    //reset size of a chest
    chestScale = 5 / 10;
    chest.style.transform = `scale(${chestScale})`;

    //start countdown animation
    start.style.animation = 'startUp forwards';
    timerButton.style.animation = 'start .7s forwards';
    timerButton.innerHTML = 3;
    setTimeout(() => {
        timerButton.style.opacity = 0;
    }, 800);
    setTimeout(() => {
        timerButton.style.opacity = 1;
        timerButton.innerHTML = 2; 
    }, 1000);
    setTimeout(() => {
        timerButton.style.opacity = 0;
    }, 1800);
    setTimeout(() => {
        timerButton.style.opacity = 1;
        timerButton.innerHTML = 1; 
    }, 2000);
    setTimeout(() => {
        timerButton.style.opacity = 0;
    }, 2800);
    setTimeout(() => {
        timerButton.style.opacity = 1;
        timerButton.innerHTML = 'Go'; 
    }, 3000);
    setTimeout(() => {
        timerButton.style.opacity = 0;
    }, 3500);
    setTimeout(() => {
        timerButton.style.opacity = 1;
        //change button to stop
        timerButton.innerHTML = 'Стоп';
        timerButton.style = '';
        start.style = '';
        timerButton.addEventListener('click', stopLevel);
        //start timer
        timer.start()
        //allow to move
        document.addEventListener('keydown', moveJug);
    }, 3600);
};

function format(minutes, seconds) {
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    time.textContent = minutes + ':' + seconds;
}

function stopLevel() {
    document.location.reload();
}
//Modal Window
//restart timer
modalButtons[0].addEventListener('click', restartLevel);
function restartLevel() {
    modalButtons[0].removeEventListener('click', restartLevel);

    modal.classList.toggle('show');
    modalWin.classList.toggle('show');
    setTimeout(() => {
        timerButton.addEventListener('click', startTimer);
        modalButtons[0].addEventListener('click', restartLevel);

        timerButton.style.opacity = 1;
        timerButton.style.display = 'inline';
        startTimer();
    }, 500);
};
//close modal
modalButtons[1].addEventListener('click', closeModal);
function closeModal() {
    modalButtons[1].removeEventListener('click', closeModal);

    modal.classList.toggle('show');
    modalWin.classList.toggle('show');
    
    //reset size of a chest
    chestScale = 5 / 10;
    chest.style.transform = `scale(${chestScale})`;
    //reset player runes
    player.runes.reset();
    //reset style
    timerButton.innerHTML = 'Старт';
    timerButton.style = '';
    start.style = '';

    timerButton.removeEventListener('click', stopLevel);
    timerButton.addEventListener('click', startTimer);
    document.addEventListener('keydown', moveJug);

    setTimeout(() => {
        modalButtons[1].addEventListener('click', closeModal)
    }, 500);
};