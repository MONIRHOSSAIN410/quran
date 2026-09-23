/**
 * Arabic (Uthmani Qur'anic script) -> Bangla উচ্চারণ (pronunciation).
 *
 * বাংলা উচ্চারণ generator. Takes a fully-vowelled ayah in the Uthmani script
 * and produces an approximate Bangla-script rendering of how it is recited.
 *
 * Scope and honest limitations
 * ----------------------------
 * This is a *letter-and-harakat* transliterator, not a tajweed engine. It
 * renders letters, short/long vowels, shadda, tanween, diphthongs, the
 * definite article (including sun-letter assimilation) and hamzatul wasl.
 * It deliberately does NOT apply the recitation rules that depend on what
 * comes next:
 *
 *   - ইখফা / ইক্বলাব / ইদগাম (the ۭ and ۢ marks are ignored)
 *   - madd lengths (2 / 4 / 6 harakat are all shown the same way)
 *   - ক্বালক্বালা, ইমালা, তাফখীম / তারক্বীক্ব
 *   - elision across word boundaries (each Arabic word stays its own Bangla
 *     word so the two lines can be read side by side)
 *
 * Several Arabic letters also collapse onto one Bangla letter because Bangla
 * has no separate sign for them (ث/ص -> ছ, ذ/ز/ظ -> য, ت/ط -> ত, ك/ق -> ক,
 * ح/ه -> হ). উচ্চারণ is therefore a *reading aid*; it cannot replace learning
 * to read the Arabic script itself, or a qualified teacher.
 */

/* ------------------------------------------------------------------ *
 * Unicode constants
 * ------------------------------------------------------------------ */

const FATHA = "َ";
const KASRA = "ِ";
const DAMMA = "ُ";
const FATHATAN = "ً";
const KASRATAN = "ٍ";
const DAMMATAN = "ٌ";
const SHADDA = "ّ";
const SUKUN = "ْ";
const MADDAH = "ٓ";
const HAMZA_ABOVE = "ٔ";
const HAMZA_BELOW = "ٕ";
const DAGGER_ALIF = "ٰ"; // superscript alef = long ā
const SMALL_WAW = "ۥ"; // = long ū
const SMALL_YEH = "ۦ"; // = long ī

const HAMZA = "ء";
const ALIF = "ا";
const ALIF_WASLA = "ٱ";
const ALIF_MAQSURA = "ى";
const WAW = "و";
const YEH = "ي";
const LAM = "ل";
const HEH = "ه";
const TEH_MARBUTA = "ة";
const AIN = "ع";

const SHORT_VOWELS = new Set([FATHA, KASRA, DAMMA]);
const TANWEEN = new Set([FATHATAN, KASRATAN, DAMMATAN]);

/** Weak letters: they may be consonants, long vowels or silent. */
const WEAK = new Set([ALIF, ALIF_MAQSURA, WAW, YEH]);

/** Marks that carry no sound for our purposes: pause signs, sajda, hizb,
 *  ikhfa / iqlab dots, tatweel, BOM. */
const DROPPED = new Set([
  "﻿",
  "ـ", // tatweel
  "ۖ",
  "ۗ",
  "ۘ",
  "ۙ",
  "ۚ",
  "ۛ",
  "ۜ",
  "۝",
  "۞",
  "ۢ", // small high meem (iqlab) — see note above
  "ۣ",
  "ۨ",
  "۩",
  "۪",
  "۫",
  "۬",
  "ۭ", // small low meem (ikhfa)
]);

/** "This letter is silent" markers (small high rounded / rectangular zero). */
const SILENT_MARKS = new Set(["۟", "۠"]);

/* ------------------------------------------------------------------ *
 * Letter -> Bangla consonant map
 * ------------------------------------------------------------------ */

const CONSONANTS = {
  "ب": "ব", // ب
  "ت": "ত", // ت
  "ث": "ছ", // ث
  "ج": "জ", // ج
  "ح": "হ", // ح
  "خ": "খ", // خ
  "د": "দ", // د
  "ذ": "য", // ذ
  "ر": "র", // ر
  "ز": "য", // ز
  "س": "স", // س
  "ش": "শ", // ش
  "ص": "ছ", // ص
  "ض": "দ", // ض
  "ط": "ত", // ط
  "ظ": "য", // ظ
  "غ": "গ", // غ
  "ف": "ফ", // ف
  "ق": "ক", // ق
  "ك": "ক", // ك
  "ل": "ল", // ل
  "م": "ম", // م
  "ن": "ন", // ن
  "ه": "হ", // ه
  "ة": "ত", // ة (teh marbuta, when it carries a vowel)
  "و": "ওয়", // و as a consonant
  "ي": "য়", // ي as a consonant
  "ى": "য়", // ى acting as a consonant (ٱلْحَىُّ)
};

/** Second half of a geminate, where the plain form would double badly. */
const GEMINATE_SECOND = {
  "ওয়": "ওয়",
  "য়": "য",
};

/** Letters with no consonant sound of their own — the alifs, hamza and ain. */
const CARRIERS = new Set([HAMZA, "أ", "إ", "ؤ", "ئ", ALIF, ALIF_WASLA, AIN]);

/** Carriers that are a real glottal stop, marked with an apostrophe. */
const GLOTTAL = new Set([HAMZA, "أ", "إ", "ؤ", "ئ", AIN]);

/** Bangla vowel signs (kar), attached to a consonant. */
const KAR = { a: "া", aa: "া", i: "ি", ii: "ী", u: "ু", uu: "ূ" };

/** Independent Bangla vowel letters, used when there is no consonant. */
const VOWEL = { a: "আ", aa: "আ", i: "ই", ii: "ঈ", u: "উ", uu: "ঊ" };

const HASANTA = "্";
const ZWNJ = "‌"; // keeps a hasanta visible instead of forming a ligature

/* ------------------------------------------------------------------ *
 * হুরূফে মুক্বাত্তাআত — the disconnected letters
 * ------------------------------------------------------------------ */

/**
 * The letters that open 29 surahs (الٓمٓ, يسٓ, حمٓ ...) are recited as letter
 * *names*, not as a syllable: يسٓ is "ইয়া সীন", never "ইয়্‌স". They are the one
 * place where letter-by-letter transliteration is simply wrong, so they get a
 * lookup of their own.
 */
const LETTER_NAMES = {
  "ا": "আলিফ", // ا
  "ل": "লাম", // ل
  "م": "মীম", // م
  "ص": "ছোয়াদ", // ص
  "ر": "রা", // ر
  "ك": "কাফ", // ك
  "ه": "হা", // ه
  "ي": "ইয়া", // ي
  "ع": "'আইন", // ع
  "ط": "ত্বা", // ط
  "س": "সীন", // س
  "ح": "হা", // ح
  "ق": "ক্বাফ", // ق
  "ن": "নূন", // ن
};

/** Every disconnected-letter opening that occurs in the Qur'an, bare of marks. */
const MUQATTAAT = new Set([
  "الم", // الم
  "المص", // المص
  "الر", // الر
  "المر", // المر
  "كهيعص", // كهيعص
  "طه", // طه
  "طسم", // طسم
  "طس", // طس
  "يس", // يس
  "ص", // ص
  "حم", // حم
  "عسق", // عسق
  "ق", // ق
  "ن", // ن
]);

/**
 * Returns the letter-name reading when `word` is a disconnected-letter
 * opening, or null. These words carry no harakat at all — only a maddah —
 * which is what keeps ordinary one-letter words from matching by accident.
 */
function muqattaat(word) {
  const letters = [];
  for (const ch of word) {
    if (DROPPED.has(ch) || ch === MADDAH || SILENT_MARKS.has(ch)) continue;
    // Any real harakat means this is an ordinary word.
    if (
      SHORT_VOWELS.has(ch) ||
      TANWEEN.has(ch) ||
      ch === SHADDA ||
      ch === SUKUN ||
      ch === DAGGER_ALIF
    ) {
      return null;
    }
    letters.push(ch);
  }
  const bare = letters.join("");
  if (!MUQATTAAT.has(bare)) return null;
  return letters.map((ch) => LETTER_NAMES[ch]).join(" ");
}

/** A consonant with no vowel, inside a word: হ + হসন্ত, shown separately. */
function coda(cons) {
  return cons + HASANTA + ZWNJ;
}

/* ------------------------------------------------------------------ *
 * Normalisation
 * ------------------------------------------------------------------ */

function normalize(text) {
  return (
    text
      // A hamza written over a tatweel stands on its own: يَـُٔودُهُۥ
      .replace(/ـ([ً-ْٰ]*)[ٕٔ]/g, HAMZA + "$1")
      .replace(/ـ/g, "")
      .replace(/﻿/g, "")
  );
}

/* ------------------------------------------------------------------ *
 * Tokenising
 * ------------------------------------------------------------------ */

/** Split one Arabic word into letter units carrying their own diacritics. */
function parseWord(word) {
  const units = [];
  const chars = [...word];

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (DROPPED.has(ch)) continue;
    // A diacritic with no letter in front of it (left over after a dropped
    // pause mark) carries no sound.
    if (
      SHORT_VOWELS.has(ch) ||
      TANWEEN.has(ch) ||
      ch === SHADDA ||
      ch === SUKUN ||
      ch === MADDAH ||
      ch === DAGGER_ALIF ||
      ch === SMALL_WAW ||
      ch === SMALL_YEH ||
      ch === HAMZA_ABOVE ||
      ch === HAMZA_BELOW ||
      SILENT_MARKS.has(ch)
    ) {
      continue;
    }

    const unit = {
      letter: ch,
      shadda: false,
      vowel: null, // 'a' | 'i' | 'u' | 'aa' | 'ii' | 'uu'
      tanween: null, // 'a' | 'i' | 'u'
      sukun: false,
      diphthong: null, // 'au' | 'ai'
      longA: false,
      longU: false,
      longI: false,
      madd: false,
      silent: false,
    };

    let j = i + 1;
    while (j < chars.length) {
      const m = chars[j];
      if (DROPPED.has(m)) {
        j++;
        continue;
      }
      if (m === SHADDA) unit.shadda = true;
      else if (m === FATHA) unit.vowel = "a";
      else if (m === KASRA) unit.vowel = "i";
      else if (m === DAMMA) unit.vowel = "u";
      else if (m === FATHATAN) unit.tanween = "a";
      else if (m === KASRATAN) unit.tanween = "i";
      else if (m === DAMMATAN) unit.tanween = "u";
      else if (m === SUKUN) unit.sukun = true;
      else if (m === MADDAH) unit.madd = true;
      else if (m === DAGGER_ALIF) unit.longA = true;
      else if (m === SMALL_WAW) unit.longU = true;
      else if (m === SMALL_YEH) unit.longI = true;
      else if (SILENT_MARKS.has(m)) unit.silent = true;
      else if (m === HAMZA_ABOVE || m === HAMZA_BELOW) {
        /* already folded into the letter */
      } else break; // the next letter
      j++;
    }
    i = j - 1;
    units.push(unit);
  }

  return units;
}

/**
 * Fold letters of prolongation into the preceding unit as a long vowel, and
 * resolve the aw / ay diphthongs.
 */
function resolveLongVowels(units) {
  const out = [];

  for (const u of units) {
    if (u.silent) continue;

    const prev = out[out.length - 1];
    const consonantal = u.shadda || u.vowel || u.tanween;

    if (prev && WEAK.has(u.letter) && !consonantal) {
      // fatha + waw/ya -> diphthong (يَوْم, عَلَيْهِمْ, شَىْء)
      if (prev.vowel === "a" && !prev.diphthong) {
        if (u.letter === WAW) {
          prev.diphthong = "au";
          continue;
        }
        if (u.letter === YEH || (u.letter === ALIF_MAQSURA && u.sukun)) {
          prev.diphthong = "ai";
          continue;
        }
      }
      // letters of prolongation
      if ((u.letter === ALIF || u.letter === ALIF_MAQSURA) && prev.vowel === "a") {
        prev.vowel = "aa";
        if (u.madd) prev.madd = true;
        continue;
      }
      if (u.letter === WAW && prev.vowel === "u") {
        prev.vowel = "uu";
        if (u.madd) prev.madd = true;
        continue;
      }
      if ((u.letter === YEH || u.letter === ALIF_MAQSURA) && prev.vowel === "i") {
        prev.vowel = "ii";
        if (u.madd) prev.madd = true;
        continue;
      }
      // Anything else weak and unvowelled (the orthographic alif after
      // tanween fath, or after ـُوا) is silent.
      continue;
    }

    // A dagger alif / small waw / small ya written on THIS letter lengthens
    // its own vowel.
    if (u.longA) u.vowel = "aa";
    if (u.longU && (!u.vowel || u.vowel === "u")) u.vowel = "uu";
    if (u.longI && (!u.vowel || u.vowel === "i")) u.vowel = "ii";

    out.push(u);
  }

  return out;
}

/* ------------------------------------------------------------------ *
 * Rendering one unit
 * ------------------------------------------------------------------ */

function renderUnit(u, { wordStart, wordEnd, nextIsCarrier }) {
  const isCarrier = CARRIERS.has(u.letter);
  const glottal = GLOTTAL.has(u.letter);

  // A teh marbuta with no vowel of its own is not written in Bangla উচ্চারণ.
  if (u.letter === TEH_MARBUTA && !u.vowel && !u.tanween) return "";

  let cons = "";
  if (!isCarrier) {
    cons = CONSONANTS[u.letter] ?? "";
    if (!cons) return ""; // unknown letter — skip rather than emit noise
  }

  // য় cannot open a Bangla syllable, so a word-initial ya takes a leading ই.
  let prefix = "";
  if (!isCarrier && wordStart && (u.letter === YEH || u.letter === ALIF_MAQSURA)) {
    prefix = "ই";
  }

  // Gemination. A word-initial shadda comes from idgham with the previous
  // word, so there is nothing to double against here.
  if (u.shadda && !wordStart && cons) {
    cons = cons + HASANTA + (GEMINATE_SECOND[cons] ?? cons);
  }

  // ---- no vowel: sukun, or the last letter of the word -------------------
  if (!u.vowel && !u.tanween) {
    if (isCarrier) return glottal ? "'" : "";
    if (wordEnd) return prefix + cons; // written bare at the end of a word
    if (nextIsCarrier) return prefix + cons; // nothing to join the হসন্ত to
    return prefix + coda(cons);
  }

  // ---- vowelled ----------------------------------------------------------
  const v = u.vowel ?? u.tanween;
  let body = isCarrier
    ? (u.letter === AIN ? "'" : "") + (VOWEL[v] ?? "")
    : prefix + cons + (KAR[v] ?? "");

  if (u.diphthong === "au") body += "ও";
  if (u.diphthong === "ai") body += "ই";

  if (u.tanween) body += "ন"; // -an / -in / -un

  return body;
}

/* ------------------------------------------------------------------ *
 * Definite article + hamzatul wasl
 * ------------------------------------------------------------------ */

/** "الله" carries an unwritten long ā, so spell it out as a special case. */
function isLafzAlJalalah(units, i) {
  return (
    (units[i].letter === ALIF_WASLA || units[i].letter === ALIF) &&
    units[i + 1]?.letter === LAM &&
    !units[i + 1].vowel &&
    !units[i + 1].sukun &&
    !units[i + 1].shadda &&
    units[i + 2]?.letter === LAM &&
    units[i + 2].shadda &&
    units[i + 3]?.letter === HEH
  );
}

function renderWord(word) {
  const letterNames = muqattaat(word);
  if (letterNames) return letterNames;

  const units = resolveLongVowels(parseWord(word));
  if (units.length === 0) return "";

  let out = "";

  for (let i = 0; i < units.length; i++) {
    const u = units[i];

    if (u.letter === ALIF_WASLA) {
      // The helping vowel of a hamzatul wasl is only pronounced when nothing
      // precedes it inside the word: وَٱلْعَصْرِ -> ওয়ালআছর, not ওয়াআলআছর.
      const atStart = i === 0;
      const next = units[i + 1];

      if (isLafzAlJalalah(units, i)) {
        const heh = units[i + 3];
        out += (atStart ? "আ" : "") + "ল্লাহ" + (heh.vowel ? KAR[heh.vowel] ?? "" : "");
        i += 3;
        continue;
      }

      if (next && next.letter === LAM) {
        // ٱلَّذِينَ — the article's ل merges into a word-initial ل, which then
        // renders doubled on its own.
        if (next.shadda) {
          out += atStart ? "আ" : "";
          continue;
        }
        // Sun letter: the ل is silent and the next letter doubles.
        const after = units[i + 2];
        if (after && after.shadda && !next.vowel && !next.sukun) {
          out += atStart ? "আ" : "";
          i += 1;
          continue;
        }
        // Moon letter: ٱلْحَمْدُ -> আলহামদু
        out += (atStart ? "আ" : "") + "ল";
        i += 1;
        continue;
      }

      // Hamzatul wasl on a verb or noun (ٱسْتَمْسَكَ, ٱبْن): the helping vowel
      // is উ when the third consonant carries a damma, otherwise ই.
      if (atStart) {
        const third = units[i + 2];
        out += third && (third.vowel === "u" || third.vowel === "uu") ? "উ" : "ই";
      }
      continue;
    }

    const next = units[i + 1];
    out += renderUnit(u, {
      wordStart: out === "",
      wordEnd: i === units.length - 1,
      nextIsCarrier: Boolean(next && CARRIERS.has(next.letter)),
    });
  }

  return out;
}

/* ------------------------------------------------------------------ *
 * Public API
 * ------------------------------------------------------------------ */

/**
 * Convert one ayah of Uthmani Arabic into Bangla উচ্চারণ.
 *
 * @param {string} arabic Fully-vowelled Arabic text of a single ayah.
 * @returns {string} Bangla-script pronunciation, one Bangla word per Arabic word.
 */
export function toBanglaPronunciation(arabic) {
  if (!arabic) return "";

  const words = normalize(arabic)
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => [...w].some((c) => !DROPPED.has(c)));

  const rendered = [];
  for (const w of words) {
    const text = renderWord(w);
    if (text) rendered.push(text);
  }

  return rendered.join(" ").replace(/\s+/g, " ").trim();
}

export default toBanglaPronunciation;
