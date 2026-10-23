export const sender = { name: 'jmc. | Streamline Processes S.L.', address: 'contact@jmc-streamline.com' };

const copy = {
  de: {
    subject: 'Neue Anfrage über das Kontaktformular',
    confirmation: 'Vielen Dank für Ihre Nachricht',
    greeting: (name) => name ? `Vielen Dank, ${name},` : 'Vielen Dank für Ihre Nachricht,',
    received: 'Ihre Nachricht ist angekommen und ich werde mich so schnell wie möglich bei Ihnen melden.',
    regards: 'Beste Grüße,',
    labels: ['Name', 'E-Mail', 'Telefon', 'Nachricht'],
  },
  en: {
    subject: 'New enquiry via the contact form',
    confirmation: 'Thank you for your message',
    greeting: (name) => name ? `Thank you, ${name},` : 'Thank you for your message,',
    received: 'Your message has been received and I will get back to you as soon as possible.',
    regards: 'Best regards,',
    labels: ['Name', 'Email', 'Phone', 'Message'],
  },
};

// User input is text only. Never interpret HTML or allow header line breaks.
const escape = (value) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const html = (text) => `<div>${escape(text).replace(/\n/g, '<br>')}</div>`;

export function messages(fields) {
  const t = copy[fields.lang];
  const adminText = `${t.subject}\n\n${['name', 'email', 'phone', 'message'].map((key, i) => `${t.labels[i]}: ${fields[key] || '—'}`).join('\n\n')}`;
  const confirmationText = `${t.greeting(fields.name)}\n\n${t.received}\n\n${t.regards}\n${sender.name}\nJasmin-Madeleine A. Christensen-Matassa\nGremi des Fusters 33, Local 6\nES-07009 Palma\n\n${t.labels[2]}: +34 699 313750\n${t.labels[1]}: ${sender.address}`;
  return [
    { from: { ...sender, name: fields.name || sender.name }, to: sender, replyTo: { name: fields.name, address: fields.email }, subject: t.subject, text: adminText, html: html(adminText), disableFileAccess: true, disableUrlAccess: true },
    { from: sender, to: { name: fields.name, address: fields.email }, replyTo: sender, subject: t.confirmation, text: confirmationText, html: html(confirmationText), disableFileAccess: true, disableUrlAccess: true },
  ];
}

export function validate(input) {
  if (!input || typeof input !== 'object' || !['de', 'en'].includes(input.lang)) return null;
  const limits = { name: 200, email: 254, phone: 80, message: 10000 };
  const result = { lang: input.lang };
  for (const [key, max] of Object.entries(limits)) {
    if (typeof input[key] !== 'string' || input[key].length > max) return null;
    result[key] = input[key].trim();
    if (key !== 'message' && /[\r\n\x00]/.test(result[key])) return null;
  }
  if (!/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(result.email) || !result.message) return null;
  return result;
}
