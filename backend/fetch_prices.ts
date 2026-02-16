import 'dotenv/config';
import Stripe from 'stripe';
import fs from 'fs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-02-24.acacia' as any,
});

async function main() {
    const products = {
        'Starter': 'prod_TwMag4vafVn4tX',
        'Team Pro': 'prod_TzDi87Q7SWLlTc',
        'Team Enterprise': 'prod_TzDjWCIVaYVr1w'
    };

    let output = '';

    for (const [name, prodId] of Object.entries(products)) {
        try {
            const prices = await stripe.prices.list({
                product: prodId,
                active: true,
                limit: 1
            });

            if (prices.data.length > 0) {
                console.log(`${name}: ${prices.data[0].id}`);
                output += `${name}: ${prices.data[0].id}\n`;
            } else {
                console.log(`${name}: No active price found`);
                output += `${name}: No active price found\n`;
            }
        } catch (error: any) {
            console.error(`Error: ${error.message}`);
            output += `Error for ${name}: ${error.message}\n`;
        }
    }
    fs.writeFileSync('prices.txt', output);
}

main();
