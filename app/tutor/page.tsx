"use client";

import { useState } from "react";

export default function TutorPage() {
  const [topic, setTopic] = useState("");
  const [lesson, setLesson] = useState("");

  const explainTopic = () => {
    if (topic.toLowerCase() === "fractions") {
      setLesson(
        "Fractions ko pizza ki misaal se samjho. Agar pizza ko 4 equal hisson mein taqseem kiya jaye aur tum 1 hissa kha lo to tum ne 1/4 pizza khaya."
      );
    } else if (topic.toLowerCase() === "photosynthesis") {
      setLesson(
        "Photosynthesis wo process hai jisme plants dhoop, pani aur carbon dioxide ki madad se apna khana banate hain."
      );
    } else if (topic.toLowerCase() === "salah") {
      setLesson(
        "Salah Islam ka doosra bunyadi rukn hai. Musalman din mein 5 martaba namaz ada karte hain."
      );
    } else {
      setLesson(
        "Demo ke liye Fractions, Photosynthesis ya Salah likhein."
      );
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-center">
        AI Tutor
      </h1>

      <p className="text-center mt-2 text-gray-600">
        Enter a topic and let AI explain it.
      </p>

      <div className="mt-8">
        <input
          type="text"
          placeholder="Fractions, Photosynthesis, Salah..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full border p-3 rounded-lg"
        />

        <button
          onClick={explainTopic}
          className="mt-4 bg-black text-white px-6 py-3 rounded-lg"
        >
          Mujhe Samjhao
        </button>
      </div>

      {lesson && (
        <div className="mt-8 border rounded-xl p-6 shadow">
          <h2 className="text-2xl font-semibold mb-3">
            Lesson
          </h2>
          <p>{lesson}</p>
        </div>
      )}
    </main>
  );
}