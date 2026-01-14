// Inbound Email Parser Logic
// Extracted from Edge Function for testing

export interface InboundEmail {
  from: string;
  fromName?: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  text?: string;
  html?: string;
  replyTo?: string;
  messageId?: string;
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    type: string;
    size: number;
    content?: string;
  }>;
  envelope?: string;
  charsets?: string;
  SPF?: string;
  DKIM?: string;
}

export interface ResendInboundEmail {
  type: 'email.received';
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    reply_to?: string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Array<{
      filename: string;
      content: string;
      content_type: string;
    }>;
    headers?: Array<{
      name: string;
      value: string;
    }>;
  };
}

export interface ParsedEmail {
  fromEmail: string;
  fromName?: string;
  toEmail: string;
  ccEmails: string[];
  subject?: string;
  textBody?: string;
  htmlBody?: string;
  messageId?: string;
  replyTo?: string;
  attachments: Array<{
    filename: string;
    type: string;
    size: number;
    content?: string;
  }>;
  headers: Record<string, string>;
}

/**
 * Parse email address from "Name <email@example.com>" format
 */
export function parseEmailAddress(raw: string): { email: string; name?: string } {
  const match = raw.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return {
      name: match[1].replace(/^["']|["']$/g, ''),
      email: match[2],
    };
  }
  return { email: raw };
}

/**
 * Extract email from potentially formatted address
 */
export function extractEmail(raw: string): string {
  const match = raw.match(/<([^>]+)>/);
  return match ? match[1] : raw;
}

/**
 * Parse CC emails from comma-separated string
 */
export function parseCcEmails(cc: string | undefined): string[] {
  if (!cc) return [];
  return cc.split(',').map((e) => {
    const match = e.trim().match(/<([^>]+)>/);
    return match ? match[1] : e.trim();
  });
}

/**
 * Check if payload is from Resend
 */
export function isResendPayload(payload: unknown): payload is ResendInboundEmail {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    (payload as ResendInboundEmail).type === 'email.received' &&
    !!(payload as ResendInboundEmail).data
  );
}

/**
 * Parse Resend inbound email payload
 */
export function parseResendEmail(resend: ResendInboundEmail): ParsedEmail {
  const data = resend.data;

  // Convert headers array to object
  const headers: Record<string, string> = {};
  if (data.headers) {
    for (const h of data.headers) {
      headers[h.name] = h.value;
    }
  }

  const from = parseEmailAddress(data.from);

  return {
    fromEmail: from.email,
    fromName: from.name,
    toEmail: data.to[0] || '',
    ccEmails: data.cc || [],
    subject: data.subject,
    textBody: data.text,
    htmlBody: data.html,
    messageId: data.email_id,
    replyTo: data.reply_to?.[0],
    attachments:
      data.attachments?.map((att) => ({
        filename: att.filename,
        type: att.content_type,
        size: att.content ? Math.ceil(att.content.length * 0.75) : 0,
        content: att.content,
      })) || [],
    headers,
  };
}

/**
 * Parse generic JSON email payload
 */
export function parseGenericEmail(payload: InboundEmail): ParsedEmail {
  const from = parseEmailAddress(payload.from);
  const toEmail = extractEmail(payload.to);
  const ccEmails = parseCcEmails(payload.cc);

  return {
    fromEmail: from.email,
    fromName: payload.fromName || from.name,
    toEmail,
    ccEmails,
    subject: payload.subject,
    textBody: payload.text,
    htmlBody: payload.html,
    messageId: payload.messageId,
    replyTo: payload.replyTo,
    attachments: payload.attachments || [],
    headers: payload.headers || {},
  };
}

/**
 * Find company ID from totonos.jp subdomain
 * Example: inbox@company-slug.totonos.jp -> company-slug
 */
export function extractCompanySlugFromEmail(toEmail: string): string | null {
  const match = toEmail.match(/^[^@]+@([^.]+)\.totonos\.jp$/i);
  return match ? match[1] : null;
}
