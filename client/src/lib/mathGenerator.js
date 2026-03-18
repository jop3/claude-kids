function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getRange(difficulty) {
  if (difficulty === 1) return [1, 10];
  if (difficulty === 2) return [2, 50];
  return [10, 200];
}

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

export function generateProblem(config = {}) {
  const { operation = 'add', difficulty = 1 } = config;
  const [min, max] = getRange(difficulty);

  let question, answer;

  if (operation === 'add') {
    const a = rand(min, max);
    const b = rand(min, max);
    answer = a + b;
    question = `${a} + ${b} = ?`;
  } else if (operation === 'sub') {
    const b = rand(min, max);
    const a = rand(b, max + min);
    answer = a - b;
    question = `${a} - ${b} = ?`;
  } else if (operation === 'mul') {
    const r = difficulty === 1 ? [1, 10] : difficulty === 2 ? [2, 12] : [3, 20];
    const a = rand(r[0], r[1]);
    const b = rand(r[0], r[1]);
    answer = a * b;
    question = `${a} x ${b} = ?`;
  } else if (operation === 'div') {
    const r = difficulty === 1 ? [1, 5] : difficulty === 2 ? [2, 10] : [3, 15];
    const b = rand(r[0], r[1]);
    const a = b * rand(1, r[1]);
    answer = a / b;
    question = `${a} / ${b} = ?`;
  } else if (operation === 'fraction') {
    const d1 = rand(2, difficulty === 1 ? 4 : difficulty === 2 ? 8 : 12);
    const d2 = rand(2, difficulty === 1 ? 4 : difficulty === 2 ? 8 : 12);
    const n1 = rand(1, d1 - 1);
    const n2 = rand(1, d2 - 1);
    const commonD = d1 * d2;
    const sumN = n1 * d2 + n2 * d1;
    const g = gcd(sumN, commonD);
    const rn = sumN / g, rd = commonD / g;
    answer = rn / rd;
    question = `${n1}/${d1} + ${n2}/${d2} = ?`;
    const answerStr = rd === 1 ? `${rn}` : `${rn}/${rd}`;
    const distractors = [
      rd === 1 ? `${rn + 1}` : `${rn + 1}/${rd}`,
      rd === 1 ? `${Math.max(1, rn - 1)}` : `${Math.max(1, rn - 1)}/${rd}`,
      `${n1 + n2}/${d1 + d2}`,
    ].filter(d => d !== answerStr);
    return { question, answer: answerStr, distractors: distractors.slice(0, 3) };
  }

  const distractors = [];
  const offsets = shuffle([-3, -2, -1, 1, 2, 3]);
  for (const off of offsets) {
    const d = answer + off;
    if (d > 0 && !distractors.includes(d) && d !== answer) {
      distractors.push(d);
    }
    if (distractors.length >= 3) break;
  }
  while (distractors.length < 3) {
    distractors.push(answer + distractors.length + 1);
  }

  return { question, answer, distractors };
}

export function generateSet(n, config = {}) {
  return Array.from({ length: n }, () => generateProblem(config));
}

export function checkAnswer(problem, userAnswer) {
  const ua = String(userAnswer).trim().toLowerCase();
  const ca = String(problem.answer).trim().toLowerCase();
  return ua === ca;
}
