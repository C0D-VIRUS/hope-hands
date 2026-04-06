import nodemailer from 'nodemailer';

let transporterPromise;

async function createTransporter() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
  } = process.env;

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  // Local development fallback when SMTP credentials are not configured.
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });
}

async function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }

  return transporterPromise;
}

export async function sendDonationConfirmation({ donorEmail, donorName, item, quantity, donationUuid }) {
  const transporter = await getTransporter();
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@hopehands.local';

  const mailResult = await transporter.sendMail({
    from: fromAddress,
    to: donorEmail,
    subject: `HopeHands donation confirmation - ${donationUuid}`,
    text: [
      `Hello ${donorName},`,
      '',
      'Thank you for donating through HopeHands.',
      `Donation item: ${item}`,
      `Quantity: ${quantity}`,
      `Donation UUID: ${donationUuid}`,
      '',
      'Our team will contact you soon for pickup coordination.',
    ].join('\n'),
  });

  return {
    usedSmtp: !(mailResult.message && Buffer.isBuffer(mailResult.message)),
    preview: mailResult.message?.toString?.() || null,
    messageId: mailResult.messageId || null,
  };
}

