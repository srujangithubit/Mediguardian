import os
import cv2
import numpy as np
import json
import re
from PIL import Image
import easyocr
from fuzzywuzzy import fuzz, process

# ===================================================
# SpaCy is entirely optional — never block on it
# ===================================================
try:
    import spacy
    try:
        nlp = spacy.load("en_core_sci_md")
        SPACY_HAS_MEDICAL = True
    except Exception:
        try:
            nlp = spacy.load("en_core_web_sm")
            SPACY_HAS_MEDICAL = False
        except Exception:
            nlp = None
            SPACY_HAS_MEDICAL = False
except ImportError:
    nlp = None
    SPACY_HAS_MEDICAL = False

if nlp is None:
    print("Info: spaCy not available. Using dictionary-based extraction only (this is fine).")

# ===================================================
# EasyOCR — initialised with optimal parameters
# ===================================================
# We use EasyOCR because PaddleOCR v3.7+ crashes on Windows Python 3.13 due to oneDNN bugs
ocr_engine = easyocr.Reader(['en'], gpu=False, verbose=False)

# ===================================================
# Medical dictionary for common prescription terms
# ===================================================
MEDICATION_DICT = {
    # Common medications - Updated for Indian market
    "ors": ["ors", "oral rehydration", "electral"],
    "oxetamine": ["oxetamine"],
    "povidone iodine": ["povidone", "iodine", "betadine"],
    "multivitamin": ["multi-vitamin", "multivitamin", "vitamins"],
    "guaifenesin": ["guaifenesin", "mucinex"],
    "ambroxol": ["ambroxol", "mucolite"],
    "tretinoin": ["tretinoin", "retin-a", "retino-a"],
    "benzoyl peroxide": ["benzoyl", "peroxide", "benzac", "persol"],
    
    "amoxicillin": ["amox", "amoxil", "amoxicil", "amoxicilin", "mox", "novamox", "almoxi", "wymox"],
    "paracetamol": ["paracet", "parcetamol", "acetaminophen", "tylenol", "crocin", "panadol", "dolo", "metacin", "calpol", "sumo", "febrex", "acepar", "pacimol"],
    "ibuprofen": ["ibuprofin", "ibu", "ibuprofen", "advil", "motrin", "nurofen", "brufen", "ibugesic", "combiflam"],
    "aspirin": ["asa", "acetylsalicylic", "aspr", "disprin", "ecotrin", "bayer", "loprin", "delisprin", "colsprin"],
    "lisinopril": ["lisin", "prinivil", "zestril", "qbrelis", "listril", "hipril", "zestopril"],
    "metformin": ["metform", "glucophage", "fortamet", "glumetza", "riomet", "glycomet", "obimet", "gluformin", "glyciphage"],
    "atorvastatin": ["lipitor", "atorva", "atorvastat", "lipibec", "atorlip", "atocor", "storvas"],
    "levothyroxine": ["synthroid", "levothy", "levothyrox", "levoxyl", "tirosint", "euthyrox", "thyronorm", "eltroxin"],
    "omeprazole": ["prilosec", "omepraz", "losec", "zegerid", "priosec", "omez", "ocid"],
    "amlodipine": ["norvasc", "amlo", "amlod", "katerzia", "amlopress", "amlopres", "amlokind"],
    "metoprolol": ["lopressor", "toprol", "metopro", "toprol-xl", "betaloc", "metolar", "starpress"],
    "sertraline": ["zoloft", "sert", "sertra", "lustral", "serta", "daxid", "serlin"],
    "gabapentin": ["neurontin", "gaba", "gabap", "gralise", "horizant", "gabapin", "gaban", "progaba"],
    "hydrochlorothiazide": ["hctz", "hydrochlor", "microzide", "hydrodiuril", "hydrazide", "aquazide"],
    "simvastatin": ["zocor", "simvast", "simlup", "simcard", "simvotin", "zosta", "simgal"],
    "losartan": ["cozaar", "losart", "lavestra", "repace", "losar", "zaart", "covance"],
    "albuterol": ["proventil", "ventolin", "proair", "salbutamol", "asthalin", "ventofort", "aeromist"],
    "fluoxetine": ["prozac", "sarafem", "rapiflux", "prodep", "fludac", "flunil", "flunat"],
    "citalopram": ["celexa", "cipramil", "citalo", "celepram", "citalex", "citopam"],
    "pantoprazole": ["protonix", "pantoloc", "pantocid", "pantodac", "zipant", "pan", "panto", "pan-d", "pantozol"],
    "furosemide": ["lasix", "furos", "frusemide", "frusol", "frusenex", "diucontin"],
    "rosuvastatin": ["crestor", "rosuvast", "rosuvas", "rovista", "rostor", "colver"],
    "escitalopram": ["lexapro", "cipralex", "nexito", "feliz", "stalopam", "nexito-forte"],
    "montelukast": ["singulair", "montek", "montair", "monticope", "romilast", "monty-lc"],
    "prednisone": ["deltasone", "predni", "orasone", "predcip", "omnacortil", "wysolone"],
    "warfarin": ["coumadin", "jantoven", "warf", "warfex", "warfrant", "uniwarfin"],
    "tramadol": ["ultram", "tram", "tramahexal", "tramazac", "domadol", "tramacip"],
    "azithromycin": ["zithromax", "azithro", "z-pak", "azith", "azee", "aziwok", "azimax", "zithrocin"],
    "ciprofloxacin": ["cipro", "ciloxan", "ciproxin", "ciplox", "ciprobid", "cifran", "ciprinol"],
    "lamotrigine": ["lamictal", "lamot", "lamotrigin", "lamogard", "lamitor", "lametec"],
    "venlafaxine": ["effexor", "venlaf", "venlor", "veniz", "ventab", "venlift"],
    "insulin": ["lantus", "humulin", "novolin", "humalog", "novolog", "tresiba", "insugen", "wosulin", "basalog", "insuman", "apidra"],
    "metronidazole": ["flagyl", "metro", "metrogel", "metrogyl", "metrozole", "aristogyl"],
    "naproxen": ["aleve", "naprosyn", "anaprox", "xenar", "napra", "napxen"],
    "doxycycline": ["vibramycin", "oracea", "doxy", "doxin", "biodoxi", "doxt"],
    "cetirizine": ["zyrtec", "cetryn", "cetriz", "alerid", "cetcip", "zirtin", "cetzine"],
    "diazepam": ["valium", "valpam", "dizac", "calmpose", "zepose", "sedopam"],
    "alprazolam": ["xanax", "alprax", "tafil", "alp", "alzolam", "zolax", "restyl", "trika"],
    "clonazepam": ["klonopin", "rivotril", "clon", "petril", "clonopam", "lonazep"],
    "carvedilol": ["coreg", "carvedil", "cardivas", "carca", "carvil", "carloc"],
    "fexofenadine": ["allegra", "telfast", "fexofine", "fexova", "agimfast", "allerfast"],
    "ranitidine": ["zantac", "ranit", "rantec", "aciloc", "zinetac", "histac"],
    "diclofenac": ["voltaren", "diclof", "diclomax", "voveran", "diclonac", "reactin"],
    "ceftriaxone": ["rocephin", "ceftri", "cefaxone", "inocef", "trixone", "monotax"],
    "cefixime": ["suprax", "cefi", "taxim", "unice", "cefispan", "omnicef"],
    "esomeprazole": ["nexium", "esotrex", "esopral", "nexpro", "raciper", "sompraz"],
    "clopidogrel": ["plavix", "clopid", "plagerine", "clopilet", "deplatt", "noklot"],
    "levocetirizine": ["xyzal", "levocet", "teczine", "levazeo", "xyzra", "uvnil", "levosiz"],
    "terbinafine": ["lamisil", "terbina", "zimig", "terbiforce", "sebifin"],
    "febuxostat": ["uloric", "febugat", "febuget", "zylobact", "febustat"],
    "telmisartan": ["micardis", "telma", "telsar", "sartel", "telvas", "cresar"],
    "folic acid": ["folate", "folvite", "folet", "folacin", "folitab", "obifolic"],
    "olmesartan": ["benicar", "olmat", "olmy", "benitec", "olmezest", "olsar"],
    "vildagliptin": ["galvus", "zomelis", "jalra", "vysov", "vildalip", "viladay"],
    "sitagliptin": ["januvia", "sitagen", "istamet", "janumet", "sitaglip", "trevia"],
    "glimepiride": ["amaryl", "glimpid", "glymex", "zoryl", "glimer", "diaglip"],
    "gliclazide": ["diamicron", "lycazid", "glizid", "reclide", "odinase", "glynase"],
    "ramipril": ["altace", "cardiopril", "cardace", "ramiril", "celapres", "ramace"],
    "nebivolol": ["bystolic", "nebistar", "nebicard", "nebilong", "nebilet", "nubeta"],
    "cilnidipine": ["cilacar", "cinod", "ciladay", "neudipine", "cilaheart", "cidip"],
    "rabeprazole": ["aciphex", "rablet", "rabicip", "razo", "raboz", "pepcia"],
    "dexamethasone": ["decadron", "dexona", "dexamycin", "dexacort", "decilone", "dexasone"],
    "doxofylline": ["doxolin", "synasma", "doxobid", "doxovent", "doxoril", "doxfree"],
    "deflazacort": ["dezacor", "defcort", "defza", "xenocort", "flacort", "defolet"],
    "ondansetron": ["zofran", "ondem", "emeset", "vomitrol", "zondem", "ondemet"],
    "domperidone": ["motilium", "domstal", "vomistop", "dompan", "dompy", "domcolic"],
    "mefenamic acid": ["ponstan", "meftal", "meflam", "mefkind", "rafen", "mefgesic"],
    "aceclofenac": ["aceclo", "hifenac", "zerodol", "movon", "aceclo-plus", "acebid"],
    "nimesulide": ["nise", "nimulid", "nimek", "nimica", "nimcet", "nimsaid"],
    "hydroxyzine": ["atarax", "anxnil", "hyzox", "hydryllin", "anxipar", "hydrax"],
    "amlodipine + atenolol": ["amlokind-at", "amtas-at", "stamlo-beta", "tenolam", "amlopress-at"],
    "telmisartan + hydrochlorothiazide": ["telma-h", "telsar-h", "telvas-h", "tazloc-h", "telista-h"],
    "sulfamethoxazole + trimethoprim": ["bactrim", "septran", "cotrim", "sepmax", "oriprim"],
    "amoxicillin + clavulanic acid": ["augmentin", "moxclav", "megaclox", "clavam", "hiclav", "clavum"],
    "ofloxacin": ["oflox", "oflin", "tarivid", "zenflox", "oflacin", "exocin"],
    "torsemide": ["demadex", "dytor", "tide", "torlactone", "presage", "tomide"],
    "chlorthalidone": ["thalitone", "clorpres", "cloress", "natrilix", "thaloride"],
    "ivermectin": ["stromectol", "ivermect", "ivecop", "ivepred", "scabo", "ivernex"],
    "rifaximin": ["xifaxan", "rifagut", "rcifax", "rifakem", "rifamide"],
    "nitrofurantoin": ["furadantin", "niftran", "nitrofur", "furadoine", "nidantin"],
    "betahistine": ["serc", "vertin", "betaserc", "vertigo", "histiwel"],
    "etizolam": ["etilaam", "etizola", "sedekopan", "etizaa", "etzee", "etova"],
    "clotrimazole": ["candid", "clotri", "mycomax", "candiderma", "candifun", "clotop"],
    "ketoconazole": ["nizoral", "sebizole", "ketoz", "fungicide", "ketomac", "ketostar"],
    "fluconazole": ["diflucan", "flucz", "forcan", "syscan", "zocon", "flucos"],
    "pregabalin": ["lyrica", "pregeb", "maxgalin", "nervalin", "pregastar", "pregica"],
    "methylprednisolone": ["medrol", "methylpred", "depo-medrol", "solu-medrol", "depopred", "medrate"],
    "levetiracetam": ["keppra", "levesam", "levroxa", "levipil", "levecetam", "epictal"],
    "hydroxychloroquine": ["hcqs", "plaquenil", "zyq", "hifen", "oxcq"],
    "diacerein": ["hilin", "dycerin", "artifit", "dcerin", "cartiken"],
    "vitamin d3": ["uprise", "uprise d3", "cholecalciferol", "calcirol", "arachitol", "dvital"],
    "calcium + vitamin d3": ["protect d", "shelcal", "gemcal", "cipcal", "calcium", "osteocem"],
    "vitamin k2": ["boncel", "boncel k2", "menaquinone", "k27", "gemcal k2"],
    "morphine": ["ms contin", "avinza", "kadian", "morphine sulfate"],
    "oxycodone": ["oxycontin", "roxicodone", "oxaydo", "oxycodone"],
    "codeine": ["codeine sulfate"],
    "acetaminophen + hydrocodone": ["norco", "vicodin", "lorcet", "lortab"],
}

# Build a flat lookup: alias -> canonical name (for fast reverse lookups)
_ALIAS_TO_CANONICAL = {}
for canonical, aliases in MEDICATION_DICT.items():
    _ALIAS_TO_CANONICAL[canonical.lower().replace(" ", "")] = canonical
    for alias in aliases:
        _ALIAS_TO_CANONICAL[alias.lower().replace(" ", "")] = canonical

# Non-medication keys to skip during entity extraction
_NON_MEDICATION_KEYS = {
    "milligram", "microgram", "gram", "milliliter",
    "once daily", "twice daily", "three times daily", "four times daily",
    "every morning", "every night", "every hour", "every 4 hours",
    "every 6 hours", "every 8 hours", "every 12 hours", "as needed",
    "by mouth", "intravenous", "intramuscular", "subcutaneous",
    "sublingual", "topical", "inhalation",
    "with food", "before meals", "after meals", "with water",
    "do not crush", "take with plenty of water", "dissolve in water",
    "until finished", "shake well",
    "take", "daily", "tabs", "caps", "tab", "cap", "syp", "inj", "ointment", "drop", "drops",
    "morning", "night", "evening", "afternoon", "rx", "dr", "hospital", "clinic"
}

# Dosage units (kept for extraction patterns)
DOSAGE_UNITS = ["mg", "mcg", "g", "gm", "ml", "mls", "mg/ml", "meq", "units"]


# ===================================================
# Image Preprocessing — Multi-Strategy
# ===================================================
def preprocess_image(image_path):
    """
    Multi-strategy image preprocessing for prescription OCR.
    Returns multiple preprocessed variants to maximise OCR success.
    """
    try:
        image = cv2.imread(image_path)
        if image is None:
            print(f"Error: Could not load image at {image_path}")
            return None

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        dir_name = os.path.dirname(image_path)
        base_name = os.path.basename(image_path)

        variants = {}

        # --- Variant 1: CLAHE (Contrast Limited Adaptive Histogram Equalisation) ---
        # Best for faded/low-contrast prescriptions
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        clahe_img = clahe.apply(gray)
        # Light denoise that preserves edges
        clahe_denoised = cv2.fastNlMeansDenoising(clahe_img, h=8)
        clahe_path = os.path.join(dir_name, f"enhanced_clahe_{base_name}")
        cv2.imwrite(clahe_path, clahe_denoised)
        variants["clahe"] = clahe_path

        # --- Variant 2: Adaptive threshold with proper morphology ---
        # Best for printed text on noisy backgrounds
        denoised = cv2.fastNlMeansDenoising(gray, h=10)
        # Use a larger block size (21 instead of 11) so thin strokes aren't fragmented
        thresh = cv2.adaptiveThreshold(
            denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 21, 5
        )
        # Close small gaps in letter strokes with a proper 2x2 kernel
        kernel = np.ones((2, 2), np.uint8)
        closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=1)
        thresh_path = os.path.join(dir_name, f"enhanced_thresh_{base_name}")
        cv2.imwrite(thresh_path, closed)
        variants["threshold"] = thresh_path

        # --- Variant 3: Sharpened original (minimal processing) ---
        # Best for already-decent images where heavy processing hurts
        blurred = cv2.GaussianBlur(gray, (0, 0), 3)
        sharpened = cv2.addWeighted(gray, 1.5, blurred, -0.5, 0)
        sharp_path = os.path.join(dir_name, f"enhanced_sharp_{base_name}")
        cv2.imwrite(sharp_path, sharpened)
        variants["sharpened"] = sharp_path

        # --- Variant 4: Otsu's binarisation (good for clean printed prescriptions) ---
        _, otsu = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        otsu_path = os.path.join(dir_name, f"enhanced_otsu_{base_name}")
        cv2.imwrite(otsu_path, otsu)
        variants["otsu"] = otsu_path

        return {
            "original": image_path,
            "variants": variants,
            "enhanced": clahe_path,  # primary enhanced path for backward compat
        }

    except Exception as e:
        print(f"Error in image preprocessing: {str(e)}")
        return None


# ===================================================
# Multi-Pass OCR — Actually Use All Variants
# ===================================================
def run_multiple_ocr_passes(image_data):
    """
    Run EasyOCR on the original image AND every preprocessed variant.
    Returns a list of (result, source_name) tuples.
    """
    results = []

    def _run_ocr(img_path, label):
        try:
            # EasyOCR returns: [ ([[x1,y1],...], 'text', confidence), ... ]
            easyocr_result = ocr_engine.readtext(img_path)
            if easyocr_result:
                # Reformat to match old PaddleOCR format for combine_ocr_results:
                # [[ [box], ('text', conf) ], ...]
                formatted = []
                for item in easyocr_result:
                    box = item[0]
                    text = item[1]
                    conf = item[2]
                    formatted.append([box, (text, conf)])
                
                results.append(([formatted], label))
        except Exception as e:
            print(f"  OCR pass '{label}' failed: {e}")

    # Pass 1: Original image (often the best for clean prescriptions)
    if image_data.get("original"):
        _run_ocr(image_data["original"], "original")

    # Pass 2-N: All preprocessed variants
    for variant_name, variant_path in image_data.get("variants", {}).items():
        if variant_path and os.path.exists(variant_path):
            _run_ocr(variant_path, variant_name)

    # If still nothing, try inverting the best variant
    if not results and image_data.get("enhanced"):
        try:
            img = cv2.imread(image_data["enhanced"])
            if img is not None:
                inverted = cv2.bitwise_not(img)
                inv_path = os.path.join(os.path.dirname(image_data["enhanced"]), "inverted_temp.jpg")
                cv2.imwrite(inv_path, inverted)
                _run_ocr(inv_path, "inverted")
                try:
                    os.remove(inv_path)
                except Exception:
                    pass
        except Exception:
            pass

    if not results:
        return [{"confidence": 0.0, "empty": True}]

    return results


# ===================================================
# Combine OCR Results — Merge & Deduplicate
# ===================================================
def combine_ocr_results(results):
    """
    Merge text from all OCR passes.
    For each detected text region, keep the version with the highest confidence.
    """
    if not results:
        return "", None

    # Handle empty placeholder
    if len(results) == 1 and isinstance(results[0], dict) and results[0].get("empty"):
        return "", 0.0

    # Collect all lines with confidence scores
    all_lines = []  # list of (text, confidence, source)

    for item in results:
        if isinstance(item, dict):
            continue
        result_set, source = item
        if result_set and result_set[0]:
            for line in result_set[0]:
                if len(line) >= 2:
                    text = line[1][0].strip()
                    conf = float(line[1][1])
                    if text:  # skip empty strings
                        all_lines.append((text, conf, source))

    if not all_lines:
        return "", None

    # Deduplicate: if two lines are >80% similar, keep the higher-confidence one
    unique_lines = []
    for text, conf, source in all_lines:
        is_duplicate = False
        for i, (existing_text, existing_conf, _) in enumerate(unique_lines):
            similarity = fuzz.ratio(text.lower(), existing_text.lower())
            if similarity > 80:
                is_duplicate = True
                # Keep the higher-confidence version
                if conf > existing_conf:
                    unique_lines[i] = (text, conf, source)
                break
        if not is_duplicate:
            unique_lines.append((text, conf, source))

    # Build combined text preserving insertion order
    combined_text = "\n".join(text for text, _, _ in unique_lines)
    avg_confidence = sum(c for _, c, _ in unique_lines) / len(unique_lines)

    return combined_text, avg_confidence


# ===================================================
# Fuzzy Medical Dictionary Correction
# ===================================================
def apply_medical_dictionary_correction(text):
    """
    Apply fuzzy medical dictionary correction to OCR text.
    Uses a strict threshold (85%) and handles OCR-split words.
    """
    if not text:
        return text

    corrected_text = text

    # First pass: try to find medications in the space-collapsed text
    # This catches "Para cetamol" -> "Paracetamol"
    collapsed = re.sub(r'\s+', '', text.lower())
    for canonical_nospace, canonical in _ALIAS_TO_CANONICAL.items():
        # Only apply if it's longer than 3 characters to prevent generic short string matches
        if len(canonical_nospace) > 3 and canonical_nospace in collapsed and canonical not in _NON_MEDICATION_KEYS:
            # Build pattern with optional spaces between letters AND word boundaries
            spaced_pattern = r'\b' + r'\s*'.join(re.escape(ch) for ch in canonical_nospace) + r'\b'
            corrected_text = re.sub(spaced_pattern, canonical, corrected_text, flags=re.IGNORECASE)

    # Second pass: fuzzy match individual words
    words = re.findall(r'\b[a-zA-Z]{5,}\b', corrected_text) # Only consider words 5 chars or longer to prevent hallucination
    for word in words:
        word_lower = word.lower()
        if word_lower in _NON_MEDICATION_KEYS:
            continue

        # Skip if it's already a known medication
        if word_lower in _ALIAS_TO_CANONICAL:
            continue

        # Fuzzy match against all known terms
        best_match = None
        best_score = 0

        for term in _ALIAS_TO_CANONICAL:
            if len(term) < 5:
                continue
            score = fuzz.ratio(word_lower, term)
            if score > best_score and score >= 85:  # Strict 85 threshold to prevent hallucinations
                best_score = score
                best_match = _ALIAS_TO_CANONICAL[term]

        if best_match and best_score >= 85 and best_match not in _NON_MEDICATION_KEYS:
            pattern = re.compile(r'\b' + re.escape(word) + r'\b', re.IGNORECASE)
            corrected_text = pattern.sub(best_match, corrected_text, count=1)

    return corrected_text


# ===================================================
# Extract Medical Entities — Space-Tolerant
# ===================================================
def extract_medical_entities(text):
    """
    Extract medications, dosages, frequencies, and routes from text.
    Handles OCR artifacts like split words and garbled characters.
    """
    medications = set()
    dosages = set()
    frequencies = set()
    routes = set()

    if not text:
        return {
            "medications": [],
            "dosages": [],
            "frequencies": [],
            "routes": [],
        }

    text_lower = text.lower()

    # --- Strategy 1: Space-collapsed substring matching ---
    # Catches "Para cetamol", "Amox icillin", etc.
    for canonical_nospace, canonical in _ALIAS_TO_CANONICAL.items():
        if canonical in _NON_MEDICATION_KEYS:
            continue
        if len(canonical_nospace) > 3:
            spaced_pattern = r'\b' + r'\s*'.join(re.escape(ch) for ch in canonical_nospace) + r'\b'
            if re.search(spaced_pattern, text_lower):
                medications.add(canonical)

    # --- Strategy 2: Exact word-boundary match (for clean OCR output) ---
    for key in MEDICATION_DICT:
        if key in _NON_MEDICATION_KEYS:
            continue
        if re.search(r'\b' + re.escape(key) + r'\b', text_lower):
            medications.add(key)
        else:
            for alias in MEDICATION_DICT[key]:
                if re.search(r'\b' + re.escape(alias) + r'\b', text_lower):
                    medications.add(key)
                    break

    # --- Strategy 3: Fuzzy matching on individual words ---
    # Catches slightly garbled OCR like "Paracetamol" mapped to "paracetemol"
    words = re.findall(r'\b[a-zA-Z]{5,}\b', text_lower)
    for word in words:
        if word in _NON_MEDICATION_KEYS:
            continue
        # Use process.extractBests for efficient fuzzy matching
        candidates = process.extractBests(
            word,
            list(_ALIAS_TO_CANONICAL.keys()),
            scorer=fuzz.ratio,
            score_cutoff=85, # Strict threshold to prevent hallucinating everyday words
            limit=3
        )
        for match_text, score in candidates:
            # Only allow match if the candidate itself is sufficiently long (prevent short-word aliases matching)
            if len(match_text) >= 4:
                canonical = _ALIAS_TO_CANONICAL[match_text]
                if canonical not in _NON_MEDICATION_KEYS:
                    medications.add(canonical)

    # --- Strategy 4: Sliding window for multi-word matches ---
    # Catches "amoxicillin + clavulanic acid" split across words
    words_list = text_lower.split()
    for window_size in range(2, 5):
        for i in range(len(words_list) - window_size + 1):
            window = " ".join(words_list[i:i + window_size])
            window_nospace = window.replace(" ", "")
            if window_nospace in _ALIAS_TO_CANONICAL:
                canonical = _ALIAS_TO_CANONICAL[window_nospace]
                if canonical not in _NON_MEDICATION_KEYS:
                    medications.add(canonical)

    # --- Strategy 5: SpaCy NER (only if medical model is available) ---
    if nlp and SPACY_HAS_MEDICAL:
        try:
            doc = nlp(text)
            for ent in doc.ents:
                if ent.label_ in ["CHEMICAL", "DRUG", "MEDICATION"]:
                    med_name = ent.text.strip()
                    if len(med_name) > 2 and med_name.lower() not in _NON_MEDICATION_KEYS:
                        # Try to map to canonical name
                        med_nospace = med_name.lower().replace(" ", "")
                        if med_nospace in _ALIAS_TO_CANONICAL:
                            medications.add(_ALIAS_TO_CANONICAL[med_nospace])
                        else:
                            medications.add(med_name)
        except Exception:
            pass

    # --- Pre-process for OCR numbers confusions (Dosage specific) ---
    # Replace capital 'O' with '0', and 'l' with '1' if attached directly to 'mg', 'ml', etc.
    # e.g., 50Omg -> 500mg
    def fix_dosage_ocr(text_chunk):
        # Fix O->0
        fixed = re.sub(r'(\d+)O\s*(mg|ml|mcg|g)\b', r'\g<1>0\g<2>', text_chunk, flags=re.IGNORECASE)
        # Fix common OCR error 'rng' -> 'mg'
        fixed = re.sub(r'(\d+)\s*rng\b', r'\g<1>mg', fixed, flags=re.IGNORECASE)
        return fixed
    
    fixed_text = fix_dosage_ocr(text)

    # --- Extract Dosages ---
    # Removes leading \b to allow "Paracetamol500mg" and allows spaces inside digits "50 0 mg"
    dosage_pattern = r'((?:\d\s*)+[.\d]*)\s*(' + '|'.join(re.escape(u) for u in DOSAGE_UNITS) + r')\b'
    for match in re.finditer(dosage_pattern, fixed_text, re.IGNORECASE):
        # Strip internal spaces from numbers (e.g. "50 0" -> "500")
        val = match.group(1).replace(" ", "")
        unit = match.group(2).strip()
        dosages.add(f"{val}{unit}".lower())

    # --- Extract Frequencies ---
    freq_patterns = [
        r'\b(once|twice|three times|four times)\s+daily\b',
        r'\bdaily\b',
        r'\b(q\.?d|b\.?i\.?d|t\.?i\.?d|q\.?i\.?d)\b',
        r'\b(o\.?d|b\.?d|t\.?d\.?s|q\.?d\.?s)\b',
        r'\b(every|each)\s+(\d+)\s+(hours?|days?)\b',
        r'\b(q)(\d+)(h)\b',
        r'\bprn\b',
        r'\bas needed\b',
        r'\bsos\b',
        r'\b(morning|afternoon|evening|night|bedtime)\b',
        r'\b\d(?:[-\s/]+\d)+\b', # Catches Indian dosage patterns like 1-0-1, 1-1-1, 1 1 1, 1/2-0-1
    ]
    for pattern in freq_patterns:
        for match in re.finditer(pattern, fixed_text, re.IGNORECASE):
            frequencies.add(match.group(0).strip())

    # --- Extract Routes ---
    route_patterns = [
        r'\b(oral(ly)?|by mouth|p\.?o\.?)\b',
        r'\b(intravenous|i\.?v\.?)\b',
        r'\b(intramuscular|i\.?m\.?)\b',
        r'\b(subcutaneous|s\.?c\.?|sub-?q)\b',
        r'\b(topical(ly)?)\b',
        r'\b(sublingual|s\.?l\.?)\b',
    ]
    for pattern in route_patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            routes.add(match.group(0).strip())

    return {
        "medications": sorted(list(medications)),
        "dosages": sorted(list(dosages)),
        "frequencies": sorted(list(frequencies)),
        "routes": sorted(list(routes)),
    }


# ===================================================
# Main Processing Pipeline
# ===================================================
def process_prescription_with_enhanced_ocr(image_path, output_dir=None):
    """Process a prescription image with the enhanced OCR pipeline."""
    try:
        # Prepare output paths
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
            base_name = os.path.basename(image_path)
            base_name_no_ext = os.path.splitext(base_name)[0]
            enhanced_path = os.path.join(output_dir, f"enhanced_{base_name}")
            results_path = os.path.join(output_dir, f"{base_name_no_ext}_results.json")
        else:
            enhanced_path = None
            results_path = None

        # STEP 1: Multi-strategy image preprocessing
        print(f"[OCR] Step 1: Preprocessing image...")
        image_data = preprocess_image(image_path)
        if not image_data:
            return {
                "error": "Failed to preprocess image",
                "raw_text": "",
                "cleaned_text": "",
                "medications": [],
                "dosages": [],
                "frequencies": [],
                "routes": [],
            }

        # STEP 2: Run OCR on all preprocessed variants
        print(f"[OCR] Step 2: Running multi-pass OCR...")
        ocr_results = run_multiple_ocr_passes(image_data)

        # STEP 3: Merge and deduplicate text from all passes
        print(f"[OCR] Step 3: Combining OCR results...")
        raw_text, confidence = combine_ocr_results(ocr_results)

        if not raw_text:
            print("[OCR] Warning: No text extracted from any OCR pass.")
            return {
                "image_path": image_path,
                "preprocessed_image": image_data.get("enhanced", ""),
                "raw_text": "",
                "cleaned_text": "",
                "medications": [],
                "dosages": [],
                "frequencies": [],
                "routes": [],
                "confidence": confidence if confidence is not None else 0.0,
            }

        # STEP 4: Apply fuzzy medical dictionary correction
        print(f"[OCR] Step 4: Applying medical dictionary correction...")
        corrected_text = apply_medical_dictionary_correction(raw_text)

        # STEP 5: Extract medical entities with space-tolerant matching
        print(f"[OCR] Step 5: Extracting medical entities...")
        entities = extract_medical_entities(corrected_text)

        # Also try extracting from raw text (before correction) in case correction mangled something
        raw_entities = extract_medical_entities(raw_text)
        # Merge: union of medications from both
        all_medications = sorted(set(entities["medications"]) | set(raw_entities["medications"]))
        all_dosages = sorted(set(entities["dosages"]) | set(raw_entities["dosages"]))
        all_frequencies = sorted(set(entities["frequencies"]) | set(raw_entities["frequencies"]))
        all_routes = sorted(set(entities["routes"]) | set(raw_entities["routes"]))

        results = {
            "image_path": image_path,
            "preprocessed_image": image_data.get("enhanced", ""),
            "raw_text": raw_text,
            "cleaned_text": corrected_text,
            "medications": all_medications,
            "dosages": all_dosages,
            "frequencies": all_frequencies,
            "routes": all_routes,
            "confidence": float(confidence) * 100 if confidence else 0.0,
        }

        print(f"[OCR] Extracted {len(all_medications)} medications, {len(all_dosages)} dosages, "
              f"{len(all_frequencies)} frequencies, {len(all_routes)} routes.")
        print(f"[OCR] Medications found: {all_medications}")

        # Save results
        if results_path:
            try:
                with open(results_path, 'w') as f:
                    json.dump(results, f, indent=4)
            except Exception as e:
                print(f"Error saving results: {str(e)}")

        return results

    except Exception as e:
        print(f"Error in OCR processing: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "error": f"Processing error: {str(e)}",
            "raw_text": "",
            "cleaned_text": "",
            "medications": [],
            "dosages": [],
            "frequencies": [],
            "routes": [],
        }


# ===================================================
# CLI
# ===================================================
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Enhanced Prescription OCR with PaddleOCR")
    parser.add_argument("--image", "-i", required=True, help="Path to prescription image")
    parser.add_argument("--output", "-o", default="./output", help="Output directory for results")

    args = parser.parse_args()

    print("===== Enhanced Prescription OCR Processing =====")
    print(f"Processing image: {args.image}")

    results = process_prescription_with_enhanced_ocr(args.image, args.output)

    if results.get("error"):
        print(f"\nError: {results['error']}")
    else:
        print("\n===== OCR Results =====")
        print(f"Preprocessed image: {results.get('preprocessed_image', '')}")

        print("\nExtracted text:")
        print(results.get('raw_text', ''))

        print("\nCorrected text:")
        print(results.get('cleaned_text', ''))

        print("\nDetected medications:")
        for med in results.get('medications', []):
            print(f"  - {med}")
        if not results.get('medications'):
            print("  (none detected)")

        print("\nDetected dosages:")
        for d in results.get('dosages', []):
            print(f"  - {d}")
        if not results.get('dosages'):
            print("  (none detected)")

        print("\nDetected frequencies:")
        for f_item in results.get('frequencies', []):
            print(f"  - {f_item}")
        if not results.get('frequencies'):
            print("  (none detected)")

        print("\nDetected routes:")
        for r in results.get('routes', []):
            print(f"  - {r}")
        if not results.get('routes'):
            print("  (none detected)")

        print(f"\nConfidence: {results.get('confidence', 0):.1f}%")

    print("\nProcessing complete!")
