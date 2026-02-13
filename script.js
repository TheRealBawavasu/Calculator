const display = document.querySelector('#display');
const buttons = document.querySelector('.buttons');

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    return 'Nice try. Dividing by 0 breaks reality.';
  }
  return a / b;
}

function operate(operator, a, b) {
  switch (operator) {
    case '+':
      return add(a, b);
    case '-':
      return subtract(a, b);
    case '*':
      return multiply(a, b);
    case '/':
      return divide(a, b);
    default:
      return b;
  }
}

let firstNumber = null;
let operator = null;
let secondNumber = null;
let displayValue = '0';
let shouldResetDisplay = false;
let justEvaluated = false;
let hasError = false;

function updateDisplay(value = displayValue) {
  display.textContent = value;
}

function normalizeResult(result) {
  if (typeof result === 'string') {
    return result;
  }

  if (!Number.isFinite(result)) {
    return 'Math exploded.';
  }

  const rounded = Math.round(result * 1e8) / 1e8;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function clearAll() {
  firstNumber = null;
  operator = null;
  secondNumber = null;
  displayValue = '0';
  shouldResetDisplay = false;
  justEvaluated = false;
  hasError = false;
  updateDisplay();
}

function backspace() {
  if (shouldResetDisplay || justEvaluated || hasError) {
    return;
  }

  if (displayValue.length <= 1 || (displayValue.length === 2 && displayValue.startsWith('-'))) {
    displayValue = '0';
  } else {
    displayValue = displayValue.slice(0, -1);
  }

  updateDisplay();
}

function inputDigit(digit) {
  if (hasError) {
    clearAll();
  }

  if (justEvaluated && operator === null) {
    firstNumber = null;
    secondNumber = null;
    displayValue = '0';
    justEvaluated = false;
  }

  if (shouldResetDisplay) {
    displayValue = digit;
    shouldResetDisplay = false;
  } else if (displayValue === '0') {
    displayValue = digit;
  } else {
    displayValue += digit;
  }

  updateDisplay();
}

function inputDecimal() {
  if (hasError) {
    clearAll();
  }

  if (justEvaluated && operator === null) {
    firstNumber = null;
    displayValue = '0';
    justEvaluated = false;
  }

  if (shouldResetDisplay) {
    displayValue = '0.';
    shouldResetDisplay = false;
    updateDisplay();
    return;
  }

  if (!displayValue.includes('.')) {
    displayValue += '.';
    updateDisplay();
  }
}

function evaluateCurrent() {
  if (operator === null || firstNumber === null || shouldResetDisplay || hasError) {
    return;
  }

  secondNumber = Number(displayValue);
  const rawResult = operate(operator, firstNumber, secondNumber);

  if (typeof rawResult === 'string') {
    hasError = true;
    displayValue = rawResult;
    updateDisplay();
    return;
  }

  displayValue = normalizeResult(rawResult);
  firstNumber = Number(displayValue);
  secondNumber = null;
  shouldResetDisplay = true;
  justEvaluated = true;
  updateDisplay();
}

function inputOperator(nextOperator) {
  if (hasError) {
    return;
  }

  if (operator !== null && !shouldResetDisplay) {
    evaluateCurrent();
    if (hasError) {
      return;
    }
  } else if (firstNumber === null) {
    firstNumber = Number(displayValue);
  }

  operator = nextOperator;
  shouldResetDisplay = true;
  justEvaluated = false;
}

function inputEquals() {
  if (hasError) {
    return;
  }

  if (operator === null || shouldResetDisplay) {
    return;
  }

  evaluateCurrent();
  operator = null;
}

function handleButtonPress(button) {
  const { digit } = button.dataset;
  const op = button.dataset.operator;
  const { action } = button.dataset;

  if (digit !== undefined) {
    inputDigit(digit);
    return;
  }

  if (op !== undefined) {
    inputOperator(op);
    return;
  }

  switch (action) {
    case 'decimal':
      inputDecimal();
      break;
    case 'equals':
      inputEquals();
      break;
    case 'clear':
      clearAll();
      break;
    case 'backspace':
      backspace();
      break;
    default:
      break;
  }
}

buttons.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) {
    return;
  }

  handleButtonPress(button);
});

document.addEventListener('keydown', (event) => {
  const key = event.key;

  if (key >= '0' && key <= '9') {
    inputDigit(key);
    return;
  }

  if (['+', '-', '*', '/'].includes(key)) {
    inputOperator(key);
    return;
  }

  if (key === 'Enter' || key === '=') {
    event.preventDefault();
    inputEquals();
    return;
  }

  if (key === '.') {
    inputDecimal();
    return;
  }

  if (key === 'Backspace') {
    backspace();
    return;
  }

  if (key.toLowerCase() === 'c' || key === 'Escape') {
    clearAll();
  }
});

updateDisplay();
