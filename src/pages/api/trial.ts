import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();
    const firstName = data.get('firstName')?.toString() ?? '';
    const lastName = data.get('lastName')?.toString() ?? '';
    const email = data.get('email')?.toString() ?? '';
    const phone = data.get('phone')?.toString() ?? '';
    const location = data.get('location')?.toString() ?? '';
    const source = data.get('source')?.toString() ?? '';
    const message = data.get('message')?.toString() ?? '';

    if (!firstName || !lastName || !email) {
      return new Response(JSON.stringify({ error: 'First name, last name, and email are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const resendKey = import.meta.env.RESEND_API_KEY;
    const toEmail = import.meta.env.TRIAL_FORM_EMAIL ?? 'info@lionsmma.ca';

    if (resendKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: 'Lions MMA <noreply@lionsmma.ca>',
          to: [toEmail],
          subject: `Free Trial Request — ${firstName} ${lastName}`,
          html: `
            <h2>New Free Trial Request</h2>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Location:</strong> ${location || 'Not specified'}</p>
            <p><strong>Source:</strong> ${source || 'Not specified'}</p>
            <p><strong>Message:</strong> ${message || 'None'}</p>
          `,
        }),
      });
      if (!res.ok) {
        console.error('Resend error:', await res.text());
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Trial form error:', err);
    return new Response(JSON.stringify({ error: 'Server error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
