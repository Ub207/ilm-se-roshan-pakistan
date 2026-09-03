import Link from "next/link";

const subjects = [
  "Mathematics",
  "Science",
  "English",
  "Urdu",
  "Islamiat",
];

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      {/* Hero Section */}
      <div className="text-center mt-16">
        <h1 className="text-5xl font-bold">
          ILM SE ROSHAN PAKISTAN
        </h1>

        <p className="mt-4 text-xl">
          Your Personal AI Learning Companion
        </p>

        <p className="mt-2 text-gray-600">
          Learn • Practice • Assess • Improve
        </p>

        <div className="flex gap-4 justify-center mt-8 flex-wrap">
          <Link
            href="/tutor"
            className="px-6 py-3 bg-black text-white rounded-lg"
          >
            Start Learning
          </Link>

          <Link
            href="/quiz"
            className="px-6 py-3 border rounded-lg"
          >
            Take Quiz
          </Link>

          <Link
            href="/assessment"
            className="px-6 py-3 border rounded-lg"
          >
            View Report
          </Link>
        </div>
      </div>

      {/* Subjects Section */}
      <section className="mt-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          Choose a Subject
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div
              key={subject}
              className="border rounded-xl p-6 shadow hover:shadow-lg cursor-pointer"
            >
              <h3 className="text-xl font-semibold">
                {subject}
              </h3>

              <p className="mt-2 text-gray-600">
                Start learning {subject}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          Why Ilm Se Roshan Pakistan?
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            ✓ AI Tutoring
          </div>

          <div className="border rounded-lg p-4">
            ✓ Interactive Quizzes
          </div>

          <div className="border rounded-lg p-4">
            ✓ Learning Assessment
          </div>

          <div className="border rounded-lg p-4">
            ✓ Urdu + English Support
          </div>

          <div className="border rounded-lg p-4">
            ✓ Personalized Learning Reports
          </div>

          <div className="border rounded-lg p-4">
            ✓ Low-Bandwidth Friendly
          </div>
        </div>
      </section>
    </main>
  );
}