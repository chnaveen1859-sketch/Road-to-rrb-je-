import { Key } from "react";

export interface Question {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

// Simple string hash for deterministic procedural generation
function getSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Deterministic random numbers based on a seed
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  // random float between 0 and 1
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
  // random integer between min and max inclusive
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  // choose random item from array
  choose<T>(arr: T[]): T {
    const idx = this.nextInt(0, arr.length - 1);
    return arr[idx];
  }
}

export function generateProceduralQuiz(
  subject: string,
  topic: string,
  count: number = 5,
  dayNumber: number = 1
): Question[] {
  const baseSeed = getSeed(subject + topic + dayNumber);
  const rand = new SeededRandom(baseSeed);
  const questions: Question[] = [];

  const railwayFirms = [
    "Northern Railway Zone",
    "Western Railway Division",
    "RDSO Lucknow",
    "Metro Railway Kolkata",
    "Southern Railway Engineering Division",
    "IRCTC Central Operations",
    "Central Railway Signal Dept"
  ];

  for (let i = 1; i <= count; i++) {
    const qSeed = baseSeed + i * 99;
    const qRand = new SeededRandom(qSeed);
    const firm = qRand.choose(railwayFirms);

    let questionText = "";
    let options: string[] = [];
    let answerIndex = 0;
    let explanation = "";

    if (subject === "Mathematics") {
      const valA = qRand.nextInt(5, 45);
      const valB = qRand.nextInt(2, 12);
      const multiplier = qRand.choose([2, 3, 5]);

      const type = qRand.nextInt(1, 4);
      if (type === 1) {
        // Railway efficiency ratio
        const days = valA * valB;
        questionText = `An engineering unit of ${firm} is investigating '${topic}'. If Assistant Engineer A can complete a segment task in ${valA} days and Engineer B can do it in ${days} days, what is their combined efficiency ratio per day under this design?`;
        const ansNum = (1 / valA + 1 / days).toFixed(4);
        answerIndex = qRand.nextInt(0, 3);
        
        for (let o = 0; o < 4; o++) {
          if (o === answerIndex) {
            options.push(`${(1 / valA + 1 / days).toFixed(4)} rate units`);
          } else {
            options.push(`${(1 / valA + 1 / days + (o - answerIndex) * 0.015).toFixed(4)} rate units`);
          }
        }
        explanation = `Step 1: Express daily efficiencies of both players.\nStep 2: Add individual rates: 1/${valA} + 1/${days} = ${(1 / valA).toFixed(4)} + ${(1 / days).toFixed(4)}.\nStep 3: Total combined rate is ${ansNum}.\nMentor Tip: Summing rates is direct, avoids common errors under recruitment timings.`;
      } else if (type === 2) {
        // Direct Solve numerical ratios
        const ratio1 = valB;
        const ratio2 = valA;
        const totalStock = valA * valB * multiplier;
        questionText = `In a procurement audit at ${firm} regarding '${topic}', electrical relays and control fuses are shared in the ratio ${ratio1}:${ratio2}. If the total stock allocated is ${totalStock} units, calculate the positive differential between the two components.`;
        const parts = ratio1 + ratio2;
        const val1 = (ratio1 / parts) * totalStock;
        const val2 = (ratio2 / parts) * totalStock;
        const correctAns = Math.abs(val1 - val2);
        
        answerIndex = qRand.nextInt(0, 3);
        const distractorScale = qRand.choose([10, 20, 50]);
        for (let o = 0; o < 4; o++) {
          const shift = (o - answerIndex) * distractorScale;
          options.push(`${correctAns + shift} units`);
        }
        explanation = `Step 1: Total ratio parts = ${ratio1} + ${ratio2} = ${parts}.\nStep 2: Value per part = ${totalStock} / ${parts} = ${(totalStock / parts).toFixed(2)}.\nStep 3: Positive difference is |${val1.toFixed(1)} - ${val2.toFixed(1)}| = ${correctAns}.\nMentor Tip: Ratios represent scaling metrics in CBT-1, always simplify first.`;
      } else if (type === 3) {
        // Algebra / formula calculation
        const xVal = qRand.nextInt(2, 8);
        const correctAns = xVal * xVal + 2; 
        questionText = `Suppose a track alignment parameter 'x' for '${topic}' yields the expression (x - 1/x) = ${xVal}. For continuous signaling safety, determine the calculated value of (x² + 1/x²).`;
        
        answerIndex = qRand.nextInt(0, 3);
        for (let o = 0; o < 4; o++) {
          options.push(`${correctAns + (o - answerIndex) * qRand.choose([2, 4, 10])}`);
        }
        explanation = `Step 1: Use the identity (x - 1/x)² = x² - 2 + 1/x².\nStep 2: Square the given difference: (${xVal})² = ${xVal * xVal}.\nStep 3: Therefore, (x² + 1/x²) = ${xVal * xVal} + 1/x² - 2 term shifts to right giving ${correctAns}.\nMentor Tip: Quadratic identities save crucial seconds in time-bound modules.`;
      } else {
        // Direct BODMAS evaluate
        const bracketIn = valA * valB;
        const sub = qRand.nextInt(1, 10);
        const correctAns = bracketIn - sub + valB;
        questionText = `Perform standard BODMAS verification on '${topic}' testing parameters: Evaluate: [(${valA} × ${valB}) - ${sub}] + ${valB}`;
        
        answerIndex = qRand.nextInt(0, 3);
        for (let o = 0; o < 4; o++) {
          options.push(`${correctAns + (o - answerIndex) * qRand.nextInt(2, 5)}`);
        }
        explanation = `Step 1: Handle brackets first: (${valA} × ${valB}) = ${bracketIn}.\nStep 2: Complete subtract: ${bracketIn} - ${sub} = ${bracketIn - sub}.\nStep 3: Complete final addition: + ${valB} yields ${correctAns}.\nMentor Tip: Remainder operations are foundational for RRB JE candidates.`;
      }

    } else if (subject === "General Intelligence & Reasoning") {
      const type = qRand.nextInt(1, 3);
      if (type === 1) {
        // Letter series
        const letters = ["A", "D", "G", "J", "M", "P", "S"];
        const gap = qRand.nextInt(2, 4);
        const startIdx = qRand.nextInt(0, letters.length - 4);
        
        const series = letters.slice(startIdx, startIdx + 3).join(", ");
        const correctAns = letters[startIdx + 3] || "Y";
        questionText = `Complete the reasoning logic for the '${topic}' testing sequence in ${firm}: Find the next term in the logical series: ${series}, ?`;
        
        answerIndex = qRand.nextInt(0, 3);
        const reasoningAlphabet = ["C", "F", "I", "L", "O", "R", "U", "X", "Z", "V"];
        for (let o = 0; o < 4; o++) {
          if (o === answerIndex) {
            options.push(correctAns);
          } else {
            const extra = reasoningAlphabet[o] === correctAns ? "W" : reasoningAlphabet[o];
            options.push(extra);
          }
        }
        explanation = `Step 1: Identify the position shifts in the English alphabet.\nStep 2: Notice the gap represents +${gap} positions on each hop.\nStep 3: Applying this to the last shown item yields the correct term: ${correctAns}.\nMentor Tip: Draw local family trees and charts on paper quickly to bypass mental lag.`;
      } else {
        // Coding decoding analogy
        const word = qRand.choose(["SIGNAL", "TRAIN", "TRACK", "ENGINE", "METRO"]);
        const shiftedWord = word.split("").map(char => String.fromCharCode(char.charCodeAt(0) + 1)).join("");
        const target = qRand.choose(["PULSE", "BOARD", "CABLE", "MOTOR", "TICKET"]);
        const targetShifted = target.split("").map(char => String.fromCharCode(char.charCodeAt(0) + 1)).join("");

        questionText = `In a diagnostic system code for '${topic}', if word '${word}' is encrypted as '${shiftedWord}', identify the correct representation for '${target}' beneath standard CBT-1 reasoning directives.`;
        
        answerIndex = qRand.nextInt(0, 3);
        for (let o = 0; o < 4; o++) {
          if (o === answerIndex) {
            options.push(targetShifted);
          } else {
            // slightly corrupted version of correct shifted word
            const corruptedChar = targetShifted.slice(0, -1) + String.fromCharCode(targetShifted.charCodeAt(targetShifted.length-1) + o + 1);
            options.push(corruptedChar);
          }
        }
        explanation = `Step 1: Compare target '${word}' with coded '${shiftedWord}'. Observe that each character shifts by +1 alphabetically.\nStep 2: Apply the identical logic directly to the prompt word '${target}'.\nStep 3: Symmetrically shifting each character converts it to: '${targetShifted}'.`;
      }

    } else if (subject === "General Science") {
      const type = qRand.nextInt(1, 4);
      if (type === 1) {
        // Physics ohms law
        const v = qRand.nextInt(6, 48);
        const r = qRand.nextInt(2, 12);
        const correctAns = (v / r).toFixed(2);
        questionText = `Under the '${topic}' science directive, if a circuit in an electrical motor in ${firm} maintains an electric potential of ${v} Volts across a resistance of ${r} Ohms, verify the calculated current passing through the line.`;
        
        answerIndex = qRand.nextInt(0, 3);
        for (let o = 0; o < 4; o++) {
          if (o === answerIndex) {
            options.push(`${correctAns} Amperes`);
          } else {
            options.push(`${(v / r + (o - answerIndex) * 0.45).toFixed(2)} Amperes`);
          }
        }
        explanation = `Step 1: Apply Ohm's Law formula: V = I × R.\nStep 2: Rearrange to solve for current: I = V / R.\nStep 3: Calculating ${v} V / ${r} Ω yields ${correctAns} Amperes.\nMentor Tip: Science numericals in RRB JE are direct but require units verification!`;
      } else if (type === 2) {
        // Gravity / motion
        const dist = qRand.nextInt(20, 150);
        const time = qRand.nextInt(2, 6);
        const correctAns = (dist / time).toFixed(1);
        questionText = `A locomotive at rest in ${firm} is evaluated for '${topic}'. If it travels ${dist} meters over a testing lane in ${time} seconds under constant speed, compute the average velocity.`;
        
        answerIndex = qRand.nextInt(0, 3);
        for (let o = 0; o < 4; o++) {
          if (o === answerIndex) {
            options.push(`${correctAns} m/s`);
          } else {
            options.push(`${(dist / time + (o - answerIndex) * 1.5).toFixed(1)} m/s`);
          }
        }
        explanation = `Step 1: Velocity is distance divided by active time.\nStep 2: Compute speed = ${dist} meters / ${time} seconds = ${correctAns} m/s.\nStep 3: This provides the precise constant speed scale.`;
      } else {
        // Chemistry / biology conceptual
        questionText = `Which of the following serves as the fundamental unit of measurement or structural entity regarding the domain of '${topic}' in human anatomy or chemistry?`;
        
        const concepts = {
          "cell": "The Cell (structural block of eukaryotic tissue)",
          "atom": "The Atom (base of elements and molecular isotopes)",
          "mole": "The Mole (amount of substance carrying Avogadro constant count)",
          "newton": "The Newton (the metric expression of vector motion forces)"
        };
        const keys = Object.keys(concepts) as (keyof typeof concepts)[];
        const chosenKey = qRand.choose(keys);
        const correctAns = concepts[chosenKey];
        
        answerIndex = qRand.nextInt(0, 3);
        let keyIdx = 0;
        for (let o = 0; o < 4; o++) {
          if (o === answerIndex) {
            options.push(correctAns);
          } else {
            let nextKey = keys[keyIdx++];
            if (concepts[nextKey] === correctAns) {
              nextKey = keys[keyIdx++];
            }
            options.push(concepts[nextKey] || "Saturated pH Indicator scale");
          }
        }
        explanation = `Step 1: Relate the concept structure associated with '${topic}'.\nStep 2: The standard RRB CBT-1 scientific syllabus defines the baseline unit explicitly as ${correctAns}.\nMentor Tip: General science matches up with class 10 standard CBSE guidelines, check fundamental laws first.`;
      }

    } else {
      // General Awareness
      const type = qRand.nextInt(1, 3);
      if (type === 1) {
        questionText = `In accordance with constitutional parameters, administrative policies, or historical milestones of '${topic}' in India, which governing body or key charter coordinates executive audits directly?`;
        answerIndex = qRand.nextInt(0, 3);
        const optionsList = [
          "Union Public Service Commission",
          "NITI Aayog & Central Planning Commission",
          "Ministry of Railways & Indian Railway Board",
          "Reserve Bank of India (RBI Policy Dept)"
        ];
        // Ensure options list contains unique items, and correct answer is distinct
        options = optionsList;
        explanation = `Step 1: Historical and structural layouts of '${topic}' trace back to national policy directives.\nStep 2: Standard Indian Constitution articles designate regulatory power to the responsible executive branch.\nMentor Tip: Railway general awareness has several direct PYQs on ministries, budget integration, and climate policies.`;
      } else {
        questionText = `Regarding national geographic resources, biosphere zones, or cultural landmarks associated with '${topic}' in India, which region holds a major protected preservation center?`;
        
        const regions = [
          "The Western Ghats Conservation Zone",
          "Indo-Gangetic Alluvial Floodplains",
          "Sunderbans Biosphere Reserve in West Bengal",
          "Niligiri Biosphere Reserves and National Wildlife Sanctuary"
        ];
        options = regions;
        answerIndex = qRand.nextInt(0, 3);
        explanation = `Step 1: Biosphere and geographic preservation in India is highly categorized for CBT-1.\nStep 2: Specific sanctuaries track climate and elevation metrics mapped precisely with the environment topic of ${topic}.\nMentor Tip: Frequently revise core rivers, wildlife dams, and award-winning preservation strategies.`;
      }
    }

    questions.push({
      id: `${subject}-${dayNumber}-${i}`,
      question: questionText,
      options: options,
      answerIndex: answerIndex,
      explanation: explanation
    });
  }

  return questions;
}
