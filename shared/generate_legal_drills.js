const fs = require('fs');
const path = require('path');

const corpTemplates = [
    "Pursuant to the terms and conditions set forth herein, {partyA} agrees to indemnify and hold harmless {partyB} from any and all claims arising out of the breach of this Agreement.",
    "Section {section_num}: Confidentiality. The Receiving Party shall not disclose any Confidential Information, including but not limited to {info_type}, to any third party without prior written consent.",
    "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without giving effect to any choice or conflict of law provision."
];

const crimTemplates = [
    "In the matter of {case_name}, the defendant is charged with {charge}. The prosecution must prove beyond a reasonable doubt all elements of the offense.",
    "Counsel for the defense objects on the grounds of {objection}. The court sustains the objection and strikes the witness's testimony regarding {testimony}.",
    "The defendant enters a plea of not guilty to the charge of {charge}. Bail is set at {amount}, and the preliminary hearing is scheduled for {date}."
];

const contractTemplates = [
    "This Non-Disclosure Agreement (the \"Agreement\") is entered into on {date} by and between {partyA} (\"Disclosing Party\") and {partyB} (\"Receiving Party\").",
    "In the event of a material breach by either party, the non-breaching party may terminate this Agreement upon {days} days written notice, provided the breach remains uncured.",
    "The parties hereto constitute independent contractors, and nothing contained in this Agreement shall be construed to create a partnership, joint venture, or agency relationship."
];

const ipTemplates = [
    "The Assignor hereby irrevocably assigns, transfers, and conveys to the Assignee all right, title, and interest in and to the Intellectual Property, including U.S. Patent No. {patent_no}.",
    "The trademark {mark} is actively used in commerce in connection with the sale of {goods}. The respondent's use of a confusingly similar mark constitutes trademark infringement.",
    "Copyright infringement is alleged regarding the unauthorized reproduction and distribution of the plaintiff's original literary work, titled {work_title}."
];

const litigationTemplates = [
    "Plaintiff respectfully requests that the Court deny Defendant's Motion to Dismiss, as the Complaint pleads sufficient factual matter to state a claim to relief that is plausible on its face.",
    "During the deposition, the deponent testified that they had no prior knowledge of the {event}. This contradicts Exhibit {exhibit_letter} entered into evidence.",
    "The parties stipulate to the admissibility of the documents Bates stamped {bates_range} for trial purposes."
];

const taxTemplates = [
    "Under Section {section_num} of the Internal Revenue Code, the transaction qualifies as a tax-free reorganization.",
    "The taxpayer claims a deduction for ordinary and necessary business expenses incurred during the taxable year, pursuant to 26 U.S.C. § 162.",
    "The IRS issued a Notice of Deficiency assessing an underpayment of income tax in the amount of {amount} for the tax year ending {date}."
];

const realEstateTemplates = [
    "The Grantor conveys and warrants to the Grantee, their heirs and assigns forever, the real estate described as {property_desc}, subject to all easements and restrictions of record.",
    "This Commercial Lease Agreement commences on {date} and expires on {date}. Tenant shall pay base rent in the amount of {amount} per month.",
    "The title search revealed an encumbrance on the property in the form of a mechanic's lien filed by {partyA} on {date}."
];

const variables = {
    partyA: ["Acme Corp", "Global Industries", "John Doe", "Jane Smith", "Tech Solutions LLC", "The Plaintiff", "The Assignor", "The Grantor"],
    partyB: ["Beta Inc", "Delta Corp", "Richard Roe", "Mary Major", "Innovate LLC", "The Defendant", "The Assignee", "The Grantee"],
    section_num: ["1.1", "4.2", "8.5", "12.3", "351", "501(c)(3)"],
    info_type: ["trade secrets", "customer lists", "financial data", "proprietary algorithms", "source code"],
    case_name: ["State v. Smith", "United States v. Doe", "People v. Johnson"],
    charge: ["grand larceny", "embezzlement", "insider trading", "perjury", "wire fraud"],
    objection: ["hearsay", "relevance", "leading the witness", "lack of foundation"],
    testimony: ["the timeline of events", "the alleged meeting", "the financial transaction", "the recovered documents"],
    amount: ["$50,000", "$100,000", "$1,000,000", "$2,500", "$5,000,000"],
    date: ["January 15, 2024", "March 1st", "December 31, 2023", "the effective date", "October 31st"],
    days: ["15", "30", "60", "90"],
    patent_no: ["9,876,543", "10,123,456", "RE45,678"],
    mark: ["'AeroDash'", "'QuantumSync'", "'NovaLumina'", "'OmniSphere'"],
    goods: ["software services", "consumer electronics", "apparel", "medical devices"],
    work_title: ["'The Silent Horizon'", "'Echoes of Eternity'", "'Advanced Algorithms'", "'Corporate Dynamics'"],
    event: ["board meeting", "merger negotiations", "data breach", "contract signing"],
    exhibit_letter: ["A", "B", "C", "D", "E"],
    bates_range: ["PROD_001001 to PROD_001050", "DEF_00001 to DEF_00500", "PLTF_100 to PLTF_200"],
    property_desc: ["Lot 42 in the Whispering Pines Subdivision", "Parcel #12345-6789 in the County Assessor's Office", "the premises located at 123 Main Street"]
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
            id: `legal_${prefix}_${i}`,
            specialty: specialtyKey,
            tier: Math.random() > 0.5 ? 'INTERMEDIATE' : 'CORE',
            title: title,
            recommendedMinutes: 5,
            focusType: Math.random() > 0.5 ? 'TERMINOLOGY' : 'ENDURANCE',
            speedTargetWpm: 70 + Math.floor(Math.random() * 20),
            content: text,
            difficulty: 'Professional',
            category: 'Legal',
            description: `Auto-generated legal track drill for ${specialtyKey}.`
        });
    }
    return drills;
}

const allDrills = {
    corporate: generateDrills('Corporate', 'corp', corpTemplates, 20),
    criminal: generateDrills('Criminal', 'crim', crimTemplates, 20),
    contracts: generateDrills('Contracts', 'contract', contractTemplates, 20),
    ip: generateDrills('Intellectual Property', 'ip', ipTemplates, 20),
    litigation: generateDrills('Litigation', 'lit', litigationTemplates, 20),
    tax: generateDrills('Tax', 'tax', taxTemplates, 20),
    realestate: generateDrills('Real Estate', 're', realEstateTemplates, 20)
};

const output = `import { Drill } from '../drillLibrary';

// Auto-generated expanded legal drills
export const legalDrillPacks: Record<string, Drill[]> = ${JSON.stringify(allDrills, null, 4)};

export function getLegalDrillsBySpecialty(specialty: string): Drill[] {
    const keyMap: Record<string, string> = {
        'corporate': 'corporate',
        'criminal': 'criminal',
        'contracts': 'contracts',
        'ip': 'ip',
        'litigation': 'litigation',
        'tax': 'tax',
        'realestate': 'realestate'
    };
    
    const mappedKey = keyMap[specialty.toLowerCase().replace(/\\s+/g, '')] || specialty.toLowerCase();
    return legalDrillPacks[mappedKey] || [];
}

export function getRandomLegalDrill(tier?: 'CORE' | 'INTERMEDIATE' | 'SPECIALIST', specialty?: string): Drill | null {
    let pool: Drill[] = [];

    if (specialty) {
        pool = getLegalDrillsBySpecialty(specialty);
    } else {
        Object.values(legalDrillPacks).forEach(pack => pool.push(...pack));
    }

    if (tier) {
        pool = pool.filter(d => d.tier === tier);
    }

    if (pool.length === 0) return null;

    return pool[Math.floor(Math.random() * pool.length)];
}
`;

fs.writeFileSync(path.join(__dirname, 'tracks/legal.ts'), output);
console.log('Successfully generated 140 legal drills in legal.ts');
