// DOM

const enviornment = document.getElementById("enviornment");
const intervalBtn = document.getElementById("clearIntervalBtn");
let Q = null;

const ROWS = 3;
const COLS = 3;

const { map, rewards } = env2map(enviornment);

// Q Learning

const STEPS_PER_EPISODE = 10;
let NUM_EPISODES = 1000;
const LEARNING_RATE = 1;

// epsilon greedy decay strategy
let EPSILON = 1;
const EPSILON_DECAY = 0.001;
const GAMMA = 0.5;

const TOTAL_STATES = 9;
const TOTAL_ACTIONS = 4;

// learn params

let INTERVAL_ID = 0;

function initializeTable(numStates, numActions) {
  let table = [];
  for (let i = 0; i < numStates; i++) {
    let row = [];
    for (let j = 0; j < numActions; j++) {
      row.push(0);
    }
    table.push(row);
  }

  return table;
}

function getNextAction(Q, currentState) {
  const random = Math.random();
  const validMoves = getNeighborIndices(currentState, ROWS, COLS);

  if (random < EPSILON) {
    const r = Math.floor(Math.random() * validMoves.length);

    return {
      action: r,
      isValid: validMoves[r] != -1,
      nextState: validMoves[r],
    };
  } else {
    const maxScore = Math.max(...Q[currentState]);
    const maxScoreIndex = Q[currentState].indexOf(maxScore);
    return {
      action: maxScoreIndex,
      isValid: validMoves[maxScoreIndex] != -1,
      nextState: validMoves[maxScoreIndex],
    };
  }
}

function updateQTable(Q, state, nextState, action) {
  let reward = rewards[state];
  const newVal =
    Q[state][action] +
    LEARNING_RATE *
      (reward + GAMMA * Math.max(...Q[nextState]) - Q[state][action]);

  Q[state][action] = newVal;
}

function getReward(atState) {
  if (atState.innerText == "🐦") {
    return -8;
  } else if (atState.innerText == "🪳") {
    return 1;
  } else if (atState.innerText == "🪳🪳🪳") {
    return 8;
  } else {
    return -1;
  }
}

// UI

function env2map() {
  const map = [];
  const rewards = [];
  for (let i = 0; i < enviornment.childElementCount; i++) {
    const child = enviornment.children.item(i);
    for (let j = 0; j < child.childElementCount; j++) {
      const elem = child.children.item(j);
      const stateReward = getReward(elem);
      map.push(elem);
      rewards.push(stateReward);
    }
  }

  return { map, rewards };
}

function getNeighborIndices(index, rows, columns) {
  const row = Math.floor(index / columns);
  const column = index % columns;

  const upIndex = row > 0 ? (row - 1) * columns + column : -1;
  const downIndex = row < rows - 1 ? (row + 1) * columns + column : -1;
  const leftIndex = column > 0 ? row * columns + (column - 1) : -1;
  const rightIndex = column < columns - 1 ? row * columns + (column + 1) : -1;

  return [upIndex, downIndex, leftIndex, rightIndex];
}

function updateEnv(state) {
  map.forEach((m,idx) => {
    if(rewards[idx] == -8) {
      m.innerText = "🐦"
    }
    else if(rewards[idx] == 1) {
      m.innerText = "🪳"
    }
    else if(rewards[idx] == 8) {
      m.innerText = "🪳🪳🪳"
    }
    else {
      m.innerText = ""
    }
  });
  map[state].innerText += "🦎";
}

function checkGameEnd(state) {
  return rewards[state] == 8 || rewards[state] == -8;
}

// learning function

function learn() {
  Q = initializeTable(TOTAL_STATES, TOTAL_ACTIONS);
  // Q[0][0] = -1;

  let episode = 0;
  let state = 0;

  INTERVAL_ID = setInterval(() => {
    if (episode % 5 == 0) {
      state = 0;
      updateEnv(state);
    } else {
      const { action, nextState, isValid } = getNextAction(Q, state);
      // console.log(`${state} -> ${action} -> ${nextState}, Epsilon: ${EPSILON}`);
      if (!isValid) {
        Q[state][action] = -100;
        state = 0;
        return;
      }
      updateQTable(Q, state, nextState, action);
      updateEnv(nextState);
      EPSILON -= EPSILON_DECAY;

      // end game condition

      state = rewards[state] == 8 ? 0 : nextState;
    }

    console.clear();
    console.table(Q);
    episode++;
  }, 100);
}

learn();

intervalBtn.addEventListener("click", () => {
  clearInterval(INTERVAL_ID);
  console.table(Q);
});
