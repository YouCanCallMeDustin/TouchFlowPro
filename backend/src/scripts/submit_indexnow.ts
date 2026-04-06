import fetch from 'node-fetch';

const API_KEY = "2abfda58abd0480aa668dd43578e1700";
const HOST = "touchflowpro.com";
const KEY_LOCATION = `https://${HOST}/${API_KEY}.txt`;

const coreUrls = [
    '',
    '/free-typing-test',
    '/articles',
    '/about',
    '/faq',
    '/contact',
    '/pricing',
    '/medical-track',
    '/legal-track',
    '/coding-track',
    '/bible-practice'
].map(loc => `https://${HOST}${loc}`);

const SEO_PAGES = [
    'how-to-type-faster',
    'increase-wpm-from-60-to-100',
    'typing-speed-vs-accuracy',
    'how-to-improve-typing-accuracy',
    'typing-speed-averages', 
    'how-to-type-60-wpm',
    'medical-transcription-typing-test',
    'legal-typing-test',
    'typing-test-for-programmers',
    'typing-speed-plateau',
    'improve-typing-speed',
    '60-wpm-to-100-wpm',
    'touchflow-vs-monkeytype',
];

const articleUrls = SEO_PAGES.map(slug => `https://${HOST}/articles/${slug}`);

const allUrls = [...coreUrls, ...articleUrls];

async function submitToIndexNow() {
    console.log(`Submitting ${allUrls.length} URLs to IndexNow for ${HOST}...`);

    const payload = {
        host: HOST,
        key: API_KEY,
        keyLocation: KEY_LOCATION,
        urlList: allUrls
    };

    try {
        const response = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log("✅ Successfully submitted to IndexNow. (HTTP 200 OK)");
        } else if (response.status === 202) {
            console.log("✅ Successfully submitted. IndexNow returned HTTP 202 Accepted (URL validated and added to queue).");
        } else {
            console.error(`❌ IndexNow submission failed with HTTP ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.log("Response body:", text);
        }
    } catch(err) {
        console.error("❌ Error submitting to IndexNow:", err);
    }
}

submitToIndexNow();
