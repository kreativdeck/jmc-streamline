import { createServer } from 'node:http';
import nodemailer from 'nodemailer';
import { contactHandler } from './handler.js';

const configured = Boolean(process.env.SMTP_PASSWORD);
const transport = configured ? nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.jmc-streamline.com',
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: { user: process.env.SMTP_USER || 'contact@jmc-streamline.com', pass: process.env.SMTP_PASSWORD },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
  disableFileAccess: true,
  disableUrlAccess: true,
}) : null;

const handler = contactHandler({
  sendMail: transport ? async (mail) => {
    const result = await transport.sendMail(mail);
    if (!result.accepted?.length || result.rejected?.length) throw new Error('SMTP recipient rejected');
  } : null,
  origins: (process.env.CONTACT_ORIGINS || 'https://www.jmc-streamline.com,https://jmc-streamline.com,http://localhost:4321,http://127.0.0.1:4321').split(',').map((s) => s.trim()),
  trustProxy: process.env.CONTACT_TRUST_PROXY === 'true',
});
const server = createServer(handler);
server.requestTimeout = 30000;
server.listen(Number(process.env.CONTACT_PORT || 4322), process.env.CONTACT_HOST || '127.0.0.1', () => {
  console.log(`Kontakt-Endpunkt gestartet. SMTP ${configured ? 'konfiguriert' : 'noch nicht konfiguriert; kein Versand'}.`);
});
