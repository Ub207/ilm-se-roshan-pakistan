/**
 * Quiz question bank + round builder.
 *
 * The bank is local and deterministic on purpose: the quiz has to work when the
 * OpenRouter free tier is rate limited, and a fixed answer key is what makes
 * honest scoring (and therefore the assessment report) possible. The AI tutor is
 * where generated questions live — see `lib/tutor.ts`.
 */

import { SUBJECTS, type Subject } from "@/lib/tutor";

export type QuizQuestion = {
  id: string;
  subject: Subject;
  /** Fine-grained skill, used to compute strong/weak areas in the report. */
  topic: string;
  question: string;
  /** Exactly four choices. */
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const QUESTIONS_PER_ROUND = 5;

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "math-1",
    subject: "Mathematics",
    topic: "Fractions",
    question: "1/2 + 1/4 = ?",
    options: ["2/6", "3/4", "1/6", "2/4"],
    correctIndex: 1,
    explanation: "1/2 ko 2/4 banayein, phir 2/4 + 1/4 = 3/4.",
  },
  {
    id: "math-2",
    subject: "Mathematics",
    topic: "Equivalent Fractions",
    question: "In mein se kaun sa 2/4 ke barabar hai?",
    options: ["1/2", "2/8", "3/4", "4/6"],
    correctIndex: 0,
    explanation: "2/4 ko 2 se divide karein to 1/2 milta hai.",
  },
  {
    id: "math-3",
    subject: "Mathematics",
    topic: "Algebra",
    question: "Agar 3x = 12 hai, to x kya hai?",
    options: ["3", "4", "9", "36"],
    correctIndex: 1,
    explanation: "Dono taraf 3 se divide karein: x = 12 ÷ 3 = 4.",
  },
  {
    id: "math-4",
    subject: "Mathematics",
    topic: "Area and Perimeter",
    question: "5 cm × 4 cm ke rectangle ka area kya hoga?",
    options: ["9 cm²", "20 cm²", "18 cm²", "40 cm²"],
    correctIndex: 1,
    explanation: "Rectangle ka area = length × width = 5 × 4 = 20 cm².",
  },
  {
    id: "math-5",
    subject: "Mathematics",
    topic: "Percentages",
    question: "200 ka 15% kitna hai?",
    options: ["15", "20", "30", "300"],
    correctIndex: 2,
    explanation: "15% = 15/100, aur 200 × 15/100 = 30.",
  },
  {
    id: "sci-1",
    subject: "Science",
    topic: "Photosynthesis",
    question: "Photosynthesis ke liye paudhe kaun si gas lete hain?",
    options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
    correctIndex: 1,
    explanation:
      "Paudhe carbon dioxide lete hain aur oxygen chhorte hain.",
  },
  {
    id: "sci-2",
    subject: "Science",
    topic: "Newton's Laws",
    question:
      "Newton ke teesre qanoon ke mutabiq, har action ka barabar aur mukhalif kya hota hai?",
    options: ["Force", "Reaction", "Motion", "Mass"],
    correctIndex: 1,
    explanation:
      "Har action ka barabar aur mukhalif reaction hota hai — isi se rocket urta hai.",
  },
  {
    id: "sci-3",
    subject: "Science",
    topic: "Pendulum",
    question: "Pendulum ko wapas beech mein kaun si force khinchti hai?",
    options: ["Friction", "Gravity", "Magnetism", "Air pressure"],
    correctIndex: 1,
    explanation:
      "Gravity bob ko neeche khinchti hai, isi liye woh beech se guzarta rehta hai.",
  },
  {
    id: "sci-4",
    subject: "Science",
    topic: "Electricity",
    question: "Electric current ka unit kya hai?",
    options: ["Volt", "Watt", "Ampere", "Ohm"],
    correctIndex: 2,
    explanation: "Current amperes (A) mein napa jata hai.",
  },
  {
    id: "sci-5",
    subject: "Science",
    topic: "Heat",
    question: "Sea level par paani kis temperature par ubalta hai?",
    options: ["0 °C", "50 °C", "90 °C", "100 °C"],
    correctIndex: 3,
    explanation: "Normal pressure par paani ka boiling point 100 °C hai.",
  },
  {
    id: "eng-1",
    subject: "English",
    topic: "Tenses",
    question: 'What is the correct past tense of "go"?',
    options: ["goed", "gone", "went", "going"],
    correctIndex: 2,
    explanation: '"Go" is irregular: go → went → gone.',
  },
  {
    id: "eng-2",
    subject: "English",
    topic: "Parts of Speech",
    question: 'Which word is the adverb in "Ali reads a book quickly"?',
    options: ["Ali", "reads", "book", "quickly"],
    correctIndex: 3,
    explanation: '"Quickly" describes how he reads, so it is an adverb.',
  },
  {
    id: "eng-3",
    subject: "English",
    topic: "Nouns",
    question: 'What is the plural of "child"?',
    options: ["childs", "children", "childrens", "childes"],
    correctIndex: 1,
    explanation: '"Child" has an irregular plural: children.',
  },
  {
    id: "eng-4",
    subject: "English",
    topic: "Subject-Verb Agreement",
    question: 'Choose the correct word: "He ___ to school every day."',
    options: ["go", "goes", "gone", "going"],
    correctIndex: 1,
    explanation: 'Singular "he" takes "goes" in the present simple.',
  },
  {
    id: "eng-5",
    subject: "English",
    topic: "Vocabulary",
    question: 'Which word is the opposite of "ancient"?',
    options: ["old", "modern", "historic", "past"],
    correctIndex: 1,
    explanation: '"Ancient" means very old, so "modern" is its antonym.',
  },
  {
    id: "urdu-1",
    subject: "Urdu",
    topic: "Qawaid",
    question: "Urdu qawaid mein 'ism' kis ko kehte hain?",
    options: [
      "Kaam ka naam",
      "Kisi cheez ya shakhs ka naam",
      "Ginti ka tareeqa",
      "Jumle ka aakhri harf",
    ],
    correctIndex: 1,
    explanation: "Ism kisi shakhs, jagah ya cheez ka naam hota hai (noun).",
  },
  {
    id: "urdu-2",
    subject: "Urdu",
    topic: "Qawaid",
    question: "'Fail' jumle mein kya zahir karta hai?",
    options: ["Naam", "Kaam", "Ginti", "Jagah"],
    correctIndex: 1,
    explanation: "Fail kaam ya haalat zahir karta hai (verb).",
  },
  {
    id: "urdu-3",
    subject: "Urdu",
    topic: "Qawaid",
    question: "'Sifat' kis cheez ko bayan karti hai?",
    options: [
      "Kaam ka waqt",
      "Ism ki khoobi ya haalat",
      "Jumle ki lambai",
      "Harf ki awaz",
    ],
    correctIndex: 1,
    explanation: "Sifat ism ki khoobi ya haalat batati hai (adjective).",
  },
  {
    id: "urdu-4",
    subject: "Urdu",
    topic: "Nazm",
    question: "'Lab pe aati hai dua ban ke tamanna meri' kis ki nazm hai?",
    options: [
      "Allama Muhammad Iqbal",
      "Mirza Ghalib",
      "Faiz Ahmed Faiz",
      "Josh Malihabadi",
    ],
    correctIndex: 0,
    explanation: "Yeh Allama Iqbal ki mashhoor 'Bachche Ki Dua' hai.",
  },
  {
    id: "urdu-5",
    subject: "Urdu",
    topic: "Adab",
    question: "Pakistan ka qaumi shair kaun hai?",
    options: [
      "Faiz Ahmed Faiz",
      "Allama Muhammad Iqbal",
      "Ahmed Faraz",
      "Mirza Ghalib",
    ],
    correctIndex: 1,
    explanation: "Allama Muhammad Iqbal Pakistan ke qaumi shair hain.",
  },
  {
    id: "isl-1",
    subject: "Islamiat",
    topic: "Salah",
    question: "Din mein kitni namazein farz hain?",
    options: ["3", "5", "7", "10"],
    correctIndex: 1,
    explanation: "Fajr, Zuhr, Asr, Maghrib aur Isha — kul paanch farz namazein.",
  },
  {
    id: "isl-2",
    subject: "Islamiat",
    topic: "Arkan-e-Islam",
    question: "Islam ke arkan (pillars) kitne hain?",
    options: ["4", "5", "6", "7"],
    correctIndex: 1,
    explanation:
      "Kalima, Namaz, Roza, Zakat aur Hajj — yeh paanch arkan-e-Islam hain.",
  },
  {
    id: "isl-3",
    subject: "Islamiat",
    topic: "Roza",
    question: "Ramadan ke maheene mein kaun si ibadat farz hai?",
    options: ["Hajj", "Roza", "Umrah", "Itikaf"],
    correctIndex: 1,
    explanation: "Ramadan mein poora maheena roza rakhna farz hai.",
  },
  {
    id: "isl-4",
    subject: "Islamiat",
    topic: "Quran",
    question: "Quran Pak kitne paron par mushtamil hai?",
    options: ["20", "30", "40", "114"],
    correctIndex: 1,
    explanation: "Quran Pak 30 paron aur 114 suraton par mushtamil hai.",
  },
  {
    id: "isl-5",
    subject: "Islamiat",
    topic: "Seerat",
    question: "Nabi Kareem ﷺ ki wiladat kis shehar mein hui?",
    // "Yathrib" is Madinah's pre-Islamic name, so it cannot sit here as a
    // separate choice — two options would have been the same city.
    options: ["Madinah", "Makkah", "Taif", "Jeddah"],
    correctIndex: 1,
    explanation: "Aap ﷺ ki wiladat Makkah Mukarramah mein hui.",
  },
];

export const ALL_SUBJECTS = "All subjects";

export type QuizScope = Subject | typeof ALL_SUBJECTS;

export const QUIZ_SCOPES = [ALL_SUBJECTS, ...SUBJECTS] as const;

export function isQuizScope(value: string): value is QuizScope {
  return (QUIZ_SCOPES as readonly string[]).includes(value);
}

/** Fisher-Yates on a copy — never mutate the exported bank. */
function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = copy[i];
    copy[i] = copy[j];
    copy[j] = swap;
  }
  return copy;
}

/**
 * Build one round. Call this from an event handler, not during render: it is
 * random, so rendering it on the server and again on the client would mismatch.
 */
export function buildRound(scope: QuizScope): QuizQuestion[] {
  if (scope !== ALL_SUBJECTS) {
    return shuffle(
      QUIZ_QUESTIONS.filter((question) => question.subject === scope),
    ).slice(0, QUESTIONS_PER_ROUND);
  }

  // A mixed round takes one question per subject so no subject dominates.
  return SUBJECTS.map(
    (subject) =>
      shuffle(QUIZ_QUESTIONS.filter((question) => question.subject === subject))[0],
  )
    .filter((question): question is QuizQuestion => question !== undefined)
    .slice(0, QUESTIONS_PER_ROUND);
}

/** Shared wording so the quiz result and the report never disagree. */
export function gradeLabel(percent: number): string {
  if (percent >= 80) return "Shabash! Bohat acha kaam.";
  if (percent >= 60) return "Acha hai — thori si mashq aur chahiye.";
  if (percent >= 40) return "Theek hai, lekin revision zaroori hai.";
  return "Is topic ko dobara parhna hoga.";
}
