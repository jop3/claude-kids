export class Question {
  constructor({ id, text, type, answers, correct, subject, difficulty }) {
    this.id = id;
    this.text = text;
    this.type = type; // 'mc' | 'tf' | 'fill' | 'drag'
    this.answers = answers || [];
    this.correct = correct;
    this.subject = subject || 'ovrigt';
    this.difficulty = difficulty || 1;
  }
}

export class QuizSession {
  constructor(questions, config = {}) {
    this._questions = questions;
    this._config = { timeLimit: 0, shuffleAnswers: false, ...config };
    this._currentIndex = 0;
    this._answers = {};
    this._startTime = null;
    this._done = false;
  }

  start() {
    this._startTime = Date.now();
    this._currentIndex = 0;
    this._answers = {};
    this._done = false;
  }

  answerQuestion(questionId, answer) {
    const q = this._questions.find(q => q.id === questionId);
    if (!q) return { correct: false, explanation: '' };

    let correct = false;
    if (q.type === 'mc') {
      correct = String(answer) === String(q.correct);
    } else if (q.type === 'tf') {
      correct = String(answer) === String(q.correct);
    } else if (q.type === 'fill') {
      correct = String(answer).trim().toLowerCase() === String(q.correct).trim().toLowerCase();
    } else if (q.type === 'drag') {
      // answer is array of [leftIdx, rightIdx] pairs
      correct = JSON.stringify(answer) === JSON.stringify(q.correct);
    }

    this._answers[questionId] = { answer, correct };

    if (this._currentIndex < this._questions.length - 1) {
      this._currentIndex++;
    } else {
      this._done = true;
    }

    return { correct, explanation: q.explanation || '' };
  }

  get currentQuestion() {
    return this._questions[this._currentIndex] || null;
  }

  get score() {
    return Object.values(this._answers).filter(a => a.correct).length;
  }

  get total() {
    return this._questions.length;
  }

  get percentage() {
    if (this.total === 0) return 0;
    return Math.round((this.score / this.total) * 100);
  }

  get isDone() {
    return this._done;
  }

  reset() {
    this._currentIndex = 0;
    this._answers = {};
    this._done = false;
    this._startTime = null;
  }
}
