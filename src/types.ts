export interface DayEntry {
  day: number;
  topic: string;
  subject: string;
  dateLogged: string;
  quizCompleted: boolean;
  quizScore?: number; // percentage or correct out of 5/6/50
  focusCompleted?: boolean;
}

export interface PlaylistMap {
  "Mathematics": string;
  "General Intelligence & Reasoning": string;
  "General Science": string;
  "General Awareness": string;
}

export interface DayStudyVault {
  personalNotes: string;
  formulas: string;
  speedShortcuts: string;
}

export interface Flashcard {
  id: string;
  day: number;
  front: string;
  back: string;
  box: 1 | 2 | 3; // 1: Review Daily, 2: Review Weekly, 3: Review Monthly
  lastReviewed?: string;
}

export interface WeaknessEntry {
  subject: string;
  topic: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  dateFailed: string;
}

export interface QuizAttempt {
  day: number;
  type: "daily" | "weekly" | "grand";
  score: number; // e.g. 4
  total: number; // e.g. 5
  earnedPoints: number; // score - (total - score) * 1/3 (accounting for 1/3 negative marking penalty)
}

// Complete CBT-1 non-technical syllabus blueprint array
export const syllabus_blueprint = {
  "Mathematics": [
    "BODMAS Rule & Bracket Operations",
    "Fractions & Decimals",
    "Surds & Indices",
    "LCM & HCF",
    "Divisibility Rules & Remainder Theorem",
    "Unit Digit Calculations",
    "Square Roots & Cube Roots",
    "Ratio & Proportion",
    "Partnership & Share Distribution",
    "Problems on Ages",
    "Percentages & Fraction Conversions",
    "Profit, Loss, and Discount",
    "Simple Interest",
    "Compound Interest",
    "Time & Work Efficiency",
    "Pipes & Cisterns",
    "Time, Speed & Distance",
    "Problems on Trains",
    "Boats & Streams",
    "Average Speed & Mixtures",
    "Linear & Quadratic Equations",
    "Basic Algebraic Identities",
    "Lines, Angles, and Triangles",
    "Circles, Polygons, and Quadrilaterals",
    "2D Mensuration",
    "3D Mensuration",
    "Basic Trigonometric Ratios",
    "Standard Trigonometric Identities",
    "Elementary Statistics Mean/Median/Mode",
    "Standard Deviation"
  ],
  "General Intelligence & Reasoning": [
    "Alphabetical & Number Series",
    "Coding-Decoding",
    "Mathematical Operations & Sign Interchange",
    "Word, Number & Alphabet Analogy",
    "Classification & Odd One Out",
    "Syllogism Venn Diagrams",
    "Logical Venn Relations",
    "Blood Relations Family Tree",
    "Direction & Distance Sense Test",
    "Data Sufficiency",
    "Statement & Arguments",
    "Statement & Assumptions",
    "Conclusions & Decision Making",
    "Linear & Circular Seating Arrangement",
    "Ranking & Ordering Puzzles",
    "Mirror & Water Images",
    "Paper Cutting & Folding",
    "Embedded Figures & Figure Counting",
    "Dice and Cubes"
  ],
  "General Science": [
    "Units and Dimensions",
    "Motion, Velocity & Acceleration",
    "Newton's Laws of Motion",
    "Work, Energy, and Power",
    "Gravitation & Satellite Motion",
    "Thrust, Pressure & Archimedes Principle",
    "Sound Waves & Echoes",
    "Light Reflection & Refraction",
    "Lenses and Mirrors",
    "Human Eye & Vision Defects",
    "Ohm's Law & Electricity",
    "Resistance in Series & Parallel",
    "Magnetic Effects of Electric Current",
    "Sources of Energy",
    "States of Matter",
    "Atoms, Molecules & Mole Concept",
    "Atomic Structure, Isotopes & Valency",
    "Chemical Reactions & Balancing Equations",
    "Acids, Bases, Salts & pH Scale",
    "Metals, Non-Metals & Extraction",
    "Carbon, Allotropes & Functional Groups",
    "Periodic Classification Trends",
    "Cell Structure and Functions",
    "Plant and Animal Tissues",
    "Diversity & Classification Kingdoms",
    "Human Life Processes Nutrition/Digestion",
    "Respiration and Circulation",
    "Excretion and Coordination",
    "Nervous System & Hormones",
    "Heredity and Evolution",
    "Our Environment & Natural Resources",
    "Common Human Diseases"
  ],
  "General Awareness": [
    "Ancient & Medieval Indian History",
    "Modern National Indian Movement",
    "Indian Rivers, Dams & Geography",
    "Indian Mountains, Soil & Climate",
    "Indian Constitution Articles & Parts",
    "Fundamental Rights & Amendments",
    "Indian Economy & Budgeting Basics",
    "RBI Policies & Five-Year Plans",
    "International Organizations & Headquarters",
    "Space Programs & ISRO Developments",
    "Defense Technologies & DRDO",
    "Wildlife Sanctuaries & National Parks",
    "Sports Tournaments, Trophies & Winners",
    "Awards, Honors & Nobel Prizes",
    "Indian Culture, Festivals & Dance Forms",
    "Current Affairs Appointments & Who's Who",
    "Current Affairs Government Schemes",
    "Current Affairs Summits & Military Exercises",
    "Current Affairs Books and Authors"
  ]
};

export type SubjectKeys = keyof typeof syllabus_blueprint;
export const subjectsArray: SubjectKeys[] = [
  "Mathematics",
  "General Intelligence & Reasoning",
  "General Science",
  "General Awareness"
];
