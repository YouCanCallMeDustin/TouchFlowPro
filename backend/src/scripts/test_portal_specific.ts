import stripe from '../lib/stripe';

async function testPortal() {
    const customerId = 'cus_TwNI0joHSaqfGm';
    console.log(`Testing portal for customer ${customerId}`);

    try {
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: 'http://localhost:3000/settings',
        });
        console.log('Success:', session.url);
    } catch (e: any) {
        console.error('Stripe Portal Error:', e.message);
        console.error('Code:', e.code);
        console.error('Type:', e.type);
    }
}

testPortal();
