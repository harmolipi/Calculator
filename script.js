//calculations
const add = (x, y) => x + y;
const subtract = (x, y) => x - y;
const multiply = (x, y) => x * y;
const divide = (x, y) => {
    if (y === 0) {
        clearDisplay = true;
        divideByZero = true;
        console.log('ERROR: divide by zero');
        return 0;
    }
    return x / y;
};
const equals = (x, y) => x;

const operate = (operation, x, y) => {
    switch (operation) {
        case 'add':
            return add(x, y);
        case 'subtract':
            return subtract(x, y);
        case 'multiply':
            return multiply(x, y);
        case 'divide':
            return divide(x, y);
        case 'equals':
            return equals(x, y);
    }
};

//query selections
const display = document.querySelector('#display');
const numbers = document.querySelectorAll('.numbers');
const operators = document.querySelectorAll('.operators');
const clearButton = document.querySelector('#clear');
const backspace = document.querySelector('#backspace');
const buttons = Array.from(document.querySelectorAll('button'));
const sign = document.querySelector('#sign');
const equalButton = document.querySelector('#equals');

//constants
const displaySize = 7;
const numberList = /[\d\.]/; //check if key is a number or another button
const lastDot = /\.$/; //check if last character is a dot
const expCheck = /e\+/;
const decCheck = /\.$/
const longFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: (displaySize - 1) });

//variable initializations
let currentValue = '0';
let x = '';
let y = '';
let previousOperator = '';
let currentOperator = '';
let answer = 0;
let clearDisplay = false; //should clear the display on next keypress
let enteredNumber = false; //last button pressed was a number
let divideByZero = false; //received an error
let tooLong = false;
let clearMem = false; //starting a new operation
let isExponential = false;

//add event listeners
window.addEventListener('keydown', buttonDownAction);
window.addEventListener('keyup', buttonUpAction);
sign.addEventListener('click', signChange);
clearButton.addEventListener('click', clear);
backspace.addEventListener('click', backspaceCharacters);

numbers.forEach(number => {
    number.addEventListener('click', () => numberPress(number.value))
});

operators.forEach(operator => {
    operator.addEventListener('click', () => operatorPress(operator.id))
});

//functions

//fire actions from keypresses
function buttonDownAction(e) {
    const thisButton = document.querySelector(`[value="${e.key}"]`);
    const thisKey = thisButton.value;
    event.preventDefault();

    if (numberList.test(thisKey)) {
        thisButton.classList.add('number-click');
        numberPress(thisKey);
    } else {
        switch (thisKey) {
            case '+':
                thisButton.classList.add('operator-click');
                operatorPress('add');
                break;
            case '-':
                thisButton.classList.add('operator-click');
                operatorPress('subtract');
                break;
            case '*':
                thisButton.classList.add('operator-click');
                operatorPress('multiply');
                break;
            case '/':
                thisButton.classList.add('operator-click');
                operatorPress('divide');
                break;
            case 'Enter':
                thisButton.classList.add('operator-click');
                operatorPress('equals');
                break;
            case 'Backspace':
                thisButton.classList.add('backspace-click');
                backspaceCharacters();
                break;
            case 'Delete':
                thisButton.classList.add('number-click');
                clear();
                break;
        }
    }

};

//remove class when key is released
function buttonUpAction(e) {
    const thisButton = document.querySelector(`[value="${e.key}"]`);
    if (thisButton.classList.contains('number-click')) {
        thisButton.classList.remove('number-click');
    } else if (thisButton.classList.contains('operator-click')) {
        thisButton.classList.remove('operator-click');
    } else if (thisButton.classList.contains('backspace-click')) {
        thisButton.classList.remove('backspace-click');
    }
}

//function when a number is pressed
function numberPress(num) {
    if (clearMem) clear(); //starting a new calculation           
    if (divideByZero) clear(); //starting over after error
    updateDisplay(num);
    y = parseFloat(currentValue);
    enteredNumber = true; //last button pushed was a number
}

//function when an operator is pressed
function operatorPress(operator) {
    clearDisplay = true;

    if (clearMem) clearMem = false; //doesn't clear memory if you click on another operator after equals

    if (divideByZero) clear();

    if (currentOperator === '' || currentOperator === 'equals') {
        currentOperator = operator;
    } else {
        previousOperator = currentOperator;
        currentOperator = operator;
    }

    if (x === '') {
        x = y; //shift the previous number to x
    } else if ((enteredNumber || currentOperator === 'equals') && previousOperator !== '') {
        answer = Math.round((operate(previousOperator, x, y) * 1000)) / 1000;

        if (divideByZero) {
            answer = 'NO BUENO';

        } else if (answer.toString().length > displaySize) {

            if ((answer.toExponential(3).length > (displaySize + 2)) || answer > 1e+19 || answer < -1e+19) {
                answer = 'TOO LONG';
                console.log('ERROR: too long');
                tooLong = true;
            } else {
                answer = answer.toExponential(3);
                isExponential = true;
            }
        }

        currentValue = answer;
        updateDisplay(answer);

        if (answer !== 'NO BUENO' && answer !== 'TOO LONG') {
            x = parseFloat(answer);
        }

        clearDisplay = true;

        if (currentOperator === 'equals') {
            clearMem = true; //reset x and y to 0
        } else {
            clearMem = false; //keep numbers in memory
        }
    }

    enteredNumber = false; //last button pushed was an operator
};

//handle what appears on the display
function updateDisplay(value) {
    if (display.textContent === '0' || clearDisplay) {
        clearDisplay = false;

        if (value === '.') {
            currentValue = '0';
        } else {
            currentValue = '';
        }

        if (value === 'TOO LONG' || value === 'NO BUENO' || isExponential) {
            currentValue += value;
            display.textContent = value;
            clearDisplay = true;
            isExponential = false;
        } else {
            currentValue += value;
            if (!expCheck.test(currentValue) && !decCheck.test(currentValue)) {
                display.textContent = longFormat.format(currentValue);
            } else {
                display.textContent = currentValue;
            }
        }

    } else if (!(value === '.' && currentValue.includes('.')) && currentValue.toString().length <= displaySize) {
        currentValue += value;
        display.textContent = currentValue;

    } else if (!(value === '.' && currentValue.includes('.')) && parseFloat(currentValue).toExponential(3).length <= (displaySize + 2) && parseFloat(currentValue) <= 1e+19 && parseFloat(currentValue) >= -1e+19) {
        currentValue = parseFloat(currentValue) + value.toString();
        display.textContent = parseFloat(currentValue).toExponential(3);
    }
}

//switch between positive and negative sign
function signChange() {
    if (currentValue !== "0" && !lastDot.test(currentValue)) {
        x = parseFloat(currentValue);

        if (expCheck.test(display.textContent)) {
            answer = operate('multiply', parseFloat(currentValue), (-1));
            currentValue = answer.toExponential(3);
        } else {
            answer = operate('multiply', currentValue, (-1));
            currentValue = answer;
        }

        y = answer;
        x = '';

        if (currentValue !== "TOO LONG" && currentValue !== "NO BUENO") {
            display.textContent = currentValue;
        }
    }
}

//backspace one character at a time
function backspaceCharacters() {
    if (divideByZero || tooLong || clearMem) {
        clear();
    } else {
        currentValue = parseFloat(currentValue).toString().slice(0, -1);

        if (parseFloat(currentValue).toString().length >= (displaySize + 2)) {
            currentValue = parseFloat(currentValue).toExponential(3);
        }

        if (currentValue === '' || currentValue === '-') {
            currentValue = '0';
        }

        y = parseFloat(currentValue);

        if (currentValue !== "TOO LONG" && currentValue !== "NO BUENO") {
            display.textContent = currentValue;
        }

        clearDisplay = false;
    }
    enteredNumber = true;
};

//reset everything
function clear() {
    currentOperator = '';
    previousOperator = '';
    currentValue = '0';
    display.textContent = '0';
    x = '';
    y = '';
    answer = 0;
    divideByZero = false;
    tooLong = false;
    clearMem = false;
};