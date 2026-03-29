const fs = require('fs');
const path = require('path');

const articlesDir = path.join(__dirname, '../src/pages/articles');

// The list of all articles to process
const files = [
    'AveragesArticle.tsx',
    'FastestTypingTechniquesArticle.tsx',
    'HowToTypeFasterArticle.tsx',
    'ImproveTypingSpeedArticle.tsx',
    'SixtyToHundredArticle.tsx',
    'TouchTypingGuideArticle.tsx',
    'TypeFasterArticle.tsx',
    'TypingAccuracyArticle.tsx',
    'TypingPlateauArticle.tsx',
    'TypingPracticeArticle.tsx',
    'TypingSpeedTestArticle.tsx',
    'UltimateGuideArticle.tsx'
];

files.forEach(file => {
    const filePath = path.join(articlesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Extract basic information mapping
    const titleMatch = content.match(/<title>(.*?)<\/title>/);
    const descMatch = content.match(/<meta\s+name="description"\s+content="(.*?)"\s*\/>/);
    const urlMatch = content.match(/<meta\s+property="og:url"\s+content="(.*?)"\s*\/>/);
    const imageMatch = content.match(/<meta\s+property="og:image"\s+content="(.*?)"\s*\/>/);

    if (!titleMatch || !descMatch || !urlMatch || !imageMatch) {
        console.error(`Skipping ${file}: Missing essential 1 OG tags.`);
        return;
    }

    const title = titleMatch[1];
    const description = descMatch[1];
    const url = urlMatch[1];
    const image = imageMatch[1];

    let headlineName = title.split('|')[0].trim();

    // Preserve FAQPage if it exists
    let faqSchemaStr = "";
    // Wait, the previous script replaced scripts in the file by looking at <Helmet> inside `content`.
    // But since the previous run of the script overwrote the files with the broken syntax `{ "@context... }`, 
    // the regex to capture `application/ld+json` might still grab the broken ones.
    const scripts = [...content.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    for (const match of scripts) {
        if (match[1].includes('"@type": "FAQPage"')) {
            faqSchemaStr = match[0];
            // Fix the FAQ page if it was also broken by the previous script? 
            // Wait, did my previous script touch FAQPage content? 
            // It just appended faqSchemaStr directly: `newJsonLdTags += \n ${faqSchemaStr};`
            // So if it originally had `{JSON.stringify({ ... })}`, it remains like that... UNLESS the original file didn't have JSON.stringify and it worked. 
            // Actually the original files DID have `{JSON.stringify({...})}`. My script preserved it exactly.
        }
    }

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": headlineName,
        "description": description,
        "image": image,
        "author": {
            "@type": "Organization",
            "name": "TouchFlow Pro",
            "url": "https://touchflowpro.com"
        },
        "publisher": {
            "@type": "Organization",
            "name": "TouchFlow Pro",
            "logo": {
                "@type": "ImageObject",
                "url": "https://touchflowpro.com/logo.png"
            }
        },
        "datePublished": "2024-01-01T08:00:00+08:00",
        "dateModified": new Date().toISOString()
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://touchflowpro.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Articles",
                "item": "https://touchflowpro.com/articles"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": headlineName,
                "item": url
            }
        ]
    };

    // Format new JSON strings
    let newJsonLdTags = `
                <script type="application/ld+json">
                    {JSON.stringify(${JSON.stringify(articleSchema, null, 24).replace(/\n/g, '\n                    ')})}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(${JSON.stringify(breadcrumbSchema, null, 24).replace(/\n/g, '\n                    ')})}
                </script>`;

    if (faqSchemaStr) {
        newJsonLdTags += `\n                ${faqSchemaStr}`;
    }

    // Replace all existing <script type="application/ld+json"> inside Helmet
    const helmetRegex = /<Helmet>([\s\S]*?)<\/Helmet>/;
    const helmetMatch = content.match(helmetRegex);
    if (helmetMatch) {
        let innerHelmet = helmetMatch[1];
        // Strip out existing script tags
        innerHelmet = innerHelmet.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "");
        // Clean up excessive newlines
        innerHelmet = innerHelmet.replace(/\n\s*\n/g, '\n');
        
        // Append new
        innerHelmet += newJsonLdTags + '\n            ';

        content = content.replace(helmetRegex, `<Helmet>${innerHelmet}</Helmet>`);

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Successfully patched: ${file}`);
    } else {
        console.error(`Skipping ${file}: No <Helmet> tag found.`);
    }
});
