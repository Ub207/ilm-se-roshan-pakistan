"use client";

import { useState } from "react";

export default function QuizPage() {
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState("");

  const checkAnswer = () => {
    if (selected === "B") {
      setResult("✅ Correct! 1/2 + 1/4 = 3/4");
    } else {
      setResult("❌ Incorrect. Correct Answer: B (3/4)");
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-center">
        AI Quiz
      </h1>

      <div className="mt-8 border rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4">
          What is 1/2 + 1/4 ?
        </h2>

        <div className="space-y-3">
          <label className="block">
            <input
              type="radio"
              name="quiz"
              value="A"
              onChange={(e) => setSelected(e.target.value)}
            /> A. 2/6
          </label>

          <label className="block">
            <input
              type="radio"
              name="quiz"
              value="B"
              onChange={(e) => setSelected(e.target.value)}
            /> B. 3/4
          </label>

          <label className="block">
            <input
              type="radio"
              name="quiz"
              value="C"
              onChange={(e) => setSelected(e.target.value)}
            /> C. 1/6
          </label>

          <label className="block">
            <input
              type="radio"
              name="quiz"
              value="D"
              onChange={(e) => setSelected(e.target.value)}
            /> D. 2/4
          </label>
        </div>

        <button
          onClick={checkAnswer}
          className="mt-6 bg-black text-white px-6 py-3 rounded-lg"
        >
          Submit Answer
        </button>

        {result && (
          <div className="mt-6 p-4 border rounded-lg">
            {result}
          </div>
        )}
      </div>
    </main>
  );
}