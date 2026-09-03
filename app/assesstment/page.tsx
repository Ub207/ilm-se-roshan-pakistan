export default function AssessmentPage() {
  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-center">
        Learning Assessment
      </h1>

      <div className="mt-8 border rounded-xl p-6 shadow">
        <h2 className="text-2xl font-semibold">
          Student Progress Report
        </h2>

        <div className="mt-6">
          <p className="text-xl font-bold">
            Score: 4/5
          </p>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-green-600">
            ✓ Strong Areas
          </h3>

          <ul className="list-disc ml-6 mt-2">
            <li>Basic Fractions</li>
            <li>Adding Fractions</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-orange-600">
            ⚠ Needs Improvement
          </h3>

          <ul className="list-disc ml-6 mt-2">
            <li>Equivalent Fractions</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-blue-600">
            Recommended Next Lesson
          </h3>

          <p className="mt-2">
            Equivalent Fractions Practice
          </p>
        </div>
      </div>
    </main>
  );
}