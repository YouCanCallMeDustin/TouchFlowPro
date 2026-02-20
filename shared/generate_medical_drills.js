const fs = require('fs');
const path = require('path');

const emergencyTemplates = [
    "Patient presents to the ED with {symptom}. Vitals are {vitals}. Exam reveals {exam}. {plan}. {disposition}.",
    "Trauma activation for {injury}. Primary survey intact. {exam}. Imaging shows {imaging}. {plan}.",
    "Patient brought in by EMS for {symptom}. History of {history}. EKG shows {ekg}. {plan}. {disposition}.",
    "Chief complaint of {symptom} starting {time} ago. Pain is {pain}. {exam}. Labs pending. {plan}."
];

const radiologyTemplates = [
    "Exam: {exam_type}. Indication: {indication}. Findings: {imaging_findings}. Impression: {impression}.",
    "{exam_type} performed without contrast. The {organ} appears {appearance}. No evidence of {pathology}. Impression: {impression}.",
    "Comparison made to prior study from {time_ago}. {imaging_findings}. The {organ} is {appearance}. Impression: {impression}."
];

const cardiologyTemplates = [
    "Echocardiogram reveals {echo_findings}. Ejection fraction is {ef}%. {valves}. {plan}.",
    "Patient seen for follow-up of {condition}. Reports {symptom}. EKG demonstrates {ekg}. {plan}. {disposition}.",
    "Consult for {indication}. Patient has history of {history}. {echo_findings}. Recommendation: {plan}."
];

const surgeryTemplates = [
    "Preoperative diagnosis: {condition}. Postoperative diagnosis: Same. Procedure: {procedure}. Findings: {findings}. {plan}.",
    "The patient was prepped and draped. {incision} was made. {action} was performed. {closure}. {disposition}.",
    "Operative report. {procedure} performed under {anesthesia}. {findings}. No complications. {plan}."
];

const psychiatryTemplates = [
    "Mental status exam: Patient is {appearance}. Mood is {mood}, affect is {affect}. Thought process {thought}. Denies SI/HI. {plan}.",
    "Follow-up for {condition}. Reports {symptom}. Sleep is {sleep}. Appetite is {appetite}. {plan}."
];

const soapTemplates = [
    "S: {symptom}. O: Vitals {vitals}. Exam: {exam}. A: {condition}. P: {plan}.",
    "S: Patient follows up for {condition}. O: {exam}. A: {condition}, {status}. P: {plan}."
];

const dischargeTemplates = [
    "Admitted for {condition}. Treated with {treatment}. Course was {course}. Discharged to {disposition} on {meds}.",
    "Hospital course: Patient admitted with {symptom}, found to have {condition}. {treatment} initiated. Condition improved. Discharge instructions: {plan}."
];

const variables = {
    symptom: ["acute chest pain", "severe shortness of breath", "right lower quadrant pain", "sudden onset headache", "left-sided weakness", "persistent vomiting", "high fever and chills", "palpitations", "syncope", "abdominal pain", "dizziness"],
    vitals: ["stable", "tachycardic and hypotensive", "febrile to 102F", "hypertensive at 180/100", "hypoxic on room air", "tachypneic", "within normal limits"],
    exam: ["diffuse tenderness to palpation", "wheezing bilaterally", "murmur heard at right sternal border", "neurologically intact", "guarding and rebound tenderness", "clear to auscultation", "no focal deficits"],
    plan: ["Admit to medicine", "Discharge with strict return precautions", "Consult cardiology", "Prepare for OR", "Start IV antibiotics and fluids", "Schedule outpatient follow-up", "Increase furosemide dose", "Continue current management"],
    disposition: ["Discharged home", "Admitted to ICU", "Admitted to floor", "Transferred to tertiary center", "Discharged to SNF"],
    injury: ["motor vehicle collision", "fall from 10 feet", "blunt head trauma", "penetrating injury", "pedestrian struck"],
    history: ["hypertension", "type 2 diabetes", "coronary artery disease", "atrial fibrillation", "asthma", "chronic kidney disease"],
    ekg: ["normal sinus rhythm", "atrial fibrillation with RVR", "ST elevation in inferior leads", "LBBB", "T wave inversions"],
    time: ["2 hours", "3 days", "1 week", "12 hours"],
    pain: ["10/10 and sharp", "dull and aching", "radiating to the back", "cramping"],
    exam_type: ["CT Head without contrast", "MRI Brain", "CT Abdomen/Pelvis", "Chest X-Ray PA/Lateral", "Ultrasound Right Upper Quadrant", "Renal Ultrasound"],
    indication: ["trauma", "rule out appendicitis", "stroke symptoms", "chronic cough", "abdominal pain", "hematuria"],
    imaging_findings: ["No acute intracranial hemorrhage", "Patchy bibasilar opacities", "Gallstones present without wall thickening", "Mild degenerative changes", "Unremarkable study"],
    impression: ["Normal study", "Findings consistent with pneumonia", "Cholelithiasis without cholecystitis", "No acute pathology"],
    organ: ["liver", "gallbladder", "kidneys", "lungs", "heart size"],
    appearance: ["unremarkable", "enlarged", "within normal limits", "atrophic"],
    time_ago: ["1 year ago", "6 months ago", "last week", "2 years ago"],
    echo_findings: ["Grade 1 diastolic dysfunction", "Mild LVH", "No regional wall motion abnormalities", "Dilated left atrium"],
    ef: ["55-60", "40-45", "30-35", "60-65", "20-25"],
    valves: ["Mild mitral regurgitation", "No aortic stenosis", "Trace tricuspid regurgitation", "Severe mitral valve prolapse"],
    condition: ["heart failure exacerbation", "community acquired pneumonia", "acute appendicitis", "major depressive disorder", "generalized anxiety disorder", "sepsis", "DKA"],
    procedure: ["Laparoscopic appendectomy", "Cholecystectomy", "Incision and drainage", "Exploratory laparotomy", "CABG"],
    findings: ["inflamed appendix", "purulent fluid in the RLQ", "normal appearing bowel", "gallbladder with stones"],
    incision: ["Midline incision", "Right subcostal incision", "McBurney's incision"],
    action: ["The appendix was bluntly dissected and removed", "The gallbladder was freed from the liver bed", "Abscess was drained and packed"],
    closure: ["Fascia closed with PDS", "Skin closed with staples", "Wound left open to heal by secondary intention"],
    anesthesia: ["general endotracheal anesthesia", "MAC", "spinal anesthesia"],
    appearance: ["well-groomed but anxious", "disheveled", "calm and cooperative", "fidgety"],
    mood: ["anxious", "depressed", "euthymic", "irritable"],
    affect: ["congruent", "constricted", "flat", "labile"],
    thought: ["linear and goal-directed", "tangential", "circumstantial", "flight of ideas"],
    sleep: ["poor", "adequate", "improved", "interrupted"],
    appetite: ["fair", "decreased", "increased", "good"],
    status: ["improving", "stable", "worsening", "poorly controlled"],
    treatment: ["IV Rocephin", "lisinopril and amlodipine", "albuterol returning", "IV fluids and insulin"],
    course: ["uncomplicated", "complicated by transient AKI", "prolonged but stable"],
    meds: ["oral antibiotics", "maintenance inhalers", "new SSI regimen"]
};

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateText(template) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
        if (variables[key]) {
            return getRandom(variables[key]);
        }
        return match;
    });
}

function generateDrills(specialtyKey, prefix, templatesArray, count) {
    const drills = [];
    for (let i = 1; i <= count; i++) {
        const text = generateText(getRandom(templatesArray));

        let title = `${specialtyKey.charAt(0).toUpperCase() + specialtyKey.slice(1)} Practice ${i}`;

        drills.push({
            id: `med_${prefix}_${i}`,
            specialty: specialtyKey,
            tier: Math.random() > 0.5 ? 'INTERMEDIATE' : 'CORE',
            title: title,
            recommendedMinutes: 5,
            focusType: Math.random() > 0.5 ? 'TERMINOLOGY' : 'ENDURANCE',
            speedTargetWpm: 65 + Math.floor(Math.random() * 20),
            content: text,
            difficulty: 'Specialist',
            category: 'Medical',
            description: `Auto-generated practice drill for ${specialtyKey}.`
        });
    }
    return drills;
}

const allDrills = {
    emergency: generateDrills('Emergency', 'em', emergencyTemplates, 20),
    radiology: generateDrills('Radiology', 'rad', radiologyTemplates, 20),
    cardiology: generateDrills('Cardiology', 'cardio', cardiologyTemplates, 20),
    surgery: generateDrills('Surgery', 'surg', surgeryTemplates, 20),
    psychiatry: generateDrills('Psychiatry', 'psych', psychiatryTemplates, 20),
    soap: generateDrills('Internal Medicine', 'soap', soapTemplates, 20),
    discharge: generateDrills('Hospitalist', 'dc', dischargeTemplates, 20)
};

const output = `import { Drill } from '../drillLibrary';

// Auto-generated expanded medical drills
export const medicalDrillPacks: Record<string, Drill[]> = ${JSON.stringify(allDrills, null, 4)};

export function getMedicalDrillsBySpecialty(specialty: string): Drill[] {
    // Map the selected specialty key to the keys generated
    const keyMap: Record<string, string> = {
        'emergency': 'emergency',
        'radiology': 'radiology',
        'cardiology': 'cardiology',
        'surgery': 'surgery',
        'psychiatry': 'psychiatry',
        'soap': 'soap',
        'discharge': 'discharge'
    };
    
    const mappedKey = keyMap[specialty.toLowerCase()] || specialty.toLowerCase();
    return medicalDrillPacks[mappedKey] || [];
}

export function getRandomMedicalDrill(tier?: 'CORE' | 'INTERMEDIATE' | 'SPECIALIST', specialty?: string): Drill | null {
    let pool: Drill[] = [];

    if (specialty) {
        pool = getMedicalDrillsBySpecialty(specialty);
    } else {
        Object.values(medicalDrillPacks).forEach(pack => pool.push(...pack));
    }

    if (tier) {
        pool = pool.filter(d => d.tier === tier);
    }

    if (pool.length === 0) return null;

    return pool[Math.floor(Math.random() * pool.length)];
}
`;

fs.writeFileSync(path.join(__dirname, 'tracks/medical.ts'), output);
console.log('Successfully generated 140 medical drills in medical.ts');
