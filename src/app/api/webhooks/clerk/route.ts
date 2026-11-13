import { verifyWebhook } from '@clerk/nextjs/webhooks';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const evt = await verifyWebhook(req)

        console.log('Webhook verified:', evt);

        if (evt.type === 'user.created') {
            const { id, email_addresses, first_name, last_name } = evt.data;
            const primaryEmail = email_addresses[0]?.email_address;

            console.log('New user signed up:', {
                clerkId: id,
                email: primaryEmail,
                firstName: first_name,
                lastName: last_name,
            })
        }

        return new Response('Webhook received and verified', { status: 200 });
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return new Response('Webhook verification failed', { status: 400 });
    }
}