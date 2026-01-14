import { describe, it, expect } from 'vitest';
import {
  parseEmailAddress,
  extractEmail,
  parseCcEmails,
  isResendPayload,
  parseResendEmail,
  parseGenericEmail,
  extractCompanySlugFromEmail,
  type ResendInboundEmail,
  type InboundEmail,
} from './inbound-email-parser';

describe('parseEmailAddress', () => {
  it('parses "Name <email>" format', () => {
    const result = parseEmailAddress('John Doe <john@example.com>');
    expect(result.email).toBe('john@example.com');
    expect(result.name).toBe('John Doe');
  });

  it('parses quoted name format', () => {
    const result = parseEmailAddress('"田中 太郎" <tanaka@example.com>');
    expect(result.email).toBe('tanaka@example.com');
    expect(result.name).toBe('田中 太郎');
  });

  it('parses plain email without name', () => {
    const result = parseEmailAddress('plain@example.com');
    expect(result.email).toBe('plain@example.com');
    expect(result.name).toBeUndefined();
  });

  it('handles single-quoted names', () => {
    const result = parseEmailAddress("'Test User' <test@example.com>");
    expect(result.email).toBe('test@example.com');
    expect(result.name).toBe('Test User');
  });
});

describe('extractEmail', () => {
  it('extracts email from angle brackets', () => {
    expect(extractEmail('John <john@example.com>')).toBe('john@example.com');
  });

  it('returns original if no angle brackets', () => {
    expect(extractEmail('john@example.com')).toBe('john@example.com');
  });

  it('handles complex formatted address', () => {
    expect(extractEmail('"Sales Team" <sales@company.com>')).toBe(
      'sales@company.com'
    );
  });
});

describe('parseCcEmails', () => {
  it('parses comma-separated CC list', () => {
    const result = parseCcEmails(
      'cc1@example.com, cc2@example.com, cc3@example.com'
    );
    expect(result).toEqual([
      'cc1@example.com',
      'cc2@example.com',
      'cc3@example.com',
    ]);
  });

  it('extracts emails from formatted addresses', () => {
    const result = parseCcEmails('John <john@a.com>, Jane <jane@b.com>');
    expect(result).toEqual(['john@a.com', 'jane@b.com']);
  });

  it('returns empty array for undefined', () => {
    expect(parseCcEmails(undefined)).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(parseCcEmails('')).toEqual([]);
  });

  it('handles mixed format CC list', () => {
    const result = parseCcEmails('plain@example.com, "Name" <formatted@example.com>');
    expect(result).toEqual(['plain@example.com', 'formatted@example.com']);
  });
});

describe('isResendPayload', () => {
  it('returns true for valid Resend payload', () => {
    const payload: ResendInboundEmail = {
      type: 'email.received',
      created_at: '2024-01-15T10:00:00Z',
      data: {
        email_id: 'email-123',
        from: 'sender@example.com',
        to: ['inbox@company.totonos.jp'],
        subject: 'Test Subject',
      },
    };
    expect(isResendPayload(payload)).toBe(true);
  });

  it('returns false for non-Resend payload', () => {
    const payload = {
      from: 'sender@example.com',
      to: 'inbox@company.totonos.jp',
      subject: 'Test',
    };
    expect(isResendPayload(payload)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isResendPayload(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isResendPayload(undefined)).toBe(false);
  });

  it('returns false for wrong type', () => {
    const payload = {
      type: 'email.sent',
      data: {},
    };
    expect(isResendPayload(payload)).toBe(false);
  });
});

describe('parseResendEmail', () => {
  const baseResendPayload: ResendInboundEmail = {
    type: 'email.received',
    created_at: '2024-01-15T10:00:00Z',
    data: {
      email_id: 'email-123',
      from: 'sender@example.com',
      to: ['inbox@company.totonos.jp'],
      subject: 'Test Subject',
      text: 'Plain text body',
      html: '<p>HTML body</p>',
    },
  };

  it('parses basic Resend email', () => {
    const result = parseResendEmail(baseResendPayload);

    expect(result.fromEmail).toBe('sender@example.com');
    expect(result.toEmail).toBe('inbox@company.totonos.jp');
    expect(result.subject).toBe('Test Subject');
    expect(result.textBody).toBe('Plain text body');
    expect(result.htmlBody).toBe('<p>HTML body</p>');
    expect(result.messageId).toBe('email-123');
  });

  it('parses Resend email with formatted from address', () => {
    const payload: ResendInboundEmail = {
      ...baseResendPayload,
      data: {
        ...baseResendPayload.data,
        from: 'John Doe <john@example.com>',
      },
    };

    const result = parseResendEmail(payload);

    expect(result.fromEmail).toBe('john@example.com');
    expect(result.fromName).toBe('John Doe');
  });

  it('parses Resend email with CC', () => {
    const payload: ResendInboundEmail = {
      ...baseResendPayload,
      data: {
        ...baseResendPayload.data,
        cc: ['cc1@example.com', 'cc2@example.com'],
      },
    };

    const result = parseResendEmail(payload);

    expect(result.ccEmails).toEqual(['cc1@example.com', 'cc2@example.com']);
  });

  it('parses Resend email with reply_to', () => {
    const payload: ResendInboundEmail = {
      ...baseResendPayload,
      data: {
        ...baseResendPayload.data,
        reply_to: ['reply@example.com'],
      },
    };

    const result = parseResendEmail(payload);

    expect(result.replyTo).toBe('reply@example.com');
  });

  it('parses Resend email with attachments', () => {
    const payload: ResendInboundEmail = {
      ...baseResendPayload,
      data: {
        ...baseResendPayload.data,
        attachments: [
          {
            filename: 'document.pdf',
            content: 'SGVsbG8gV29ybGQ=', // base64 for "Hello World"
            content_type: 'application/pdf',
          },
        ],
      },
    };

    const result = parseResendEmail(payload);

    expect(result.attachments).toHaveLength(1);
    expect(result.attachments[0].filename).toBe('document.pdf');
    expect(result.attachments[0].type).toBe('application/pdf');
    expect(result.attachments[0].content).toBe('SGVsbG8gV29ybGQ=');
    expect(result.attachments[0].size).toBeGreaterThan(0);
  });

  it('parses Resend email with headers', () => {
    const payload: ResendInboundEmail = {
      ...baseResendPayload,
      data: {
        ...baseResendPayload.data,
        headers: [
          { name: 'X-Custom-Header', value: 'custom-value' },
          { name: 'X-Priority', value: '1' },
        ],
      },
    };

    const result = parseResendEmail(payload);

    expect(result.headers['X-Custom-Header']).toBe('custom-value');
    expect(result.headers['X-Priority']).toBe('1');
  });

  it('handles empty to array', () => {
    const payload: ResendInboundEmail = {
      ...baseResendPayload,
      data: {
        ...baseResendPayload.data,
        to: [],
      },
    };

    const result = parseResendEmail(payload);

    expect(result.toEmail).toBe('');
  });
});

describe('parseGenericEmail', () => {
  const basePayload: InboundEmail = {
    from: 'sender@example.com',
    to: 'inbox@company.totonos.jp',
    subject: 'Test Subject',
    text: 'Plain text body',
    html: '<p>HTML body</p>',
  };

  it('parses basic generic email', () => {
    const result = parseGenericEmail(basePayload);

    expect(result.fromEmail).toBe('sender@example.com');
    expect(result.toEmail).toBe('inbox@company.totonos.jp');
    expect(result.subject).toBe('Test Subject');
    expect(result.textBody).toBe('Plain text body');
    expect(result.htmlBody).toBe('<p>HTML body</p>');
  });

  it('parses generic email with formatted addresses', () => {
    const payload: InboundEmail = {
      ...basePayload,
      from: 'John Doe <john@example.com>',
      to: 'Inbox <inbox@company.totonos.jp>',
    };

    const result = parseGenericEmail(payload);

    expect(result.fromEmail).toBe('john@example.com');
    expect(result.fromName).toBe('John Doe');
    expect(result.toEmail).toBe('inbox@company.totonos.jp');
  });

  it('uses fromName field if provided', () => {
    const payload: InboundEmail = {
      ...basePayload,
      fromName: 'Explicit Name',
    };

    const result = parseGenericEmail(payload);

    expect(result.fromName).toBe('Explicit Name');
  });

  it('parses generic email with CC', () => {
    const payload: InboundEmail = {
      ...basePayload,
      cc: 'cc1@example.com, cc2@example.com',
    };

    const result = parseGenericEmail(payload);

    expect(result.ccEmails).toEqual(['cc1@example.com', 'cc2@example.com']);
  });

  it('includes attachments and headers', () => {
    const payload: InboundEmail = {
      ...basePayload,
      attachments: [{ filename: 'file.txt', type: 'text/plain', size: 100 }],
      headers: { 'X-Test': 'value' },
    };

    const result = parseGenericEmail(payload);

    expect(result.attachments).toHaveLength(1);
    expect(result.headers['X-Test']).toBe('value');
  });
});

describe('extractCompanySlugFromEmail', () => {
  it('extracts slug from totonos.jp subdomain', () => {
    expect(extractCompanySlugFromEmail('inbox@acme-corp.totonos.jp')).toBe(
      'acme-corp'
    );
  });

  it('extracts slug regardless of local part', () => {
    expect(extractCompanySlugFromEmail('support@mycompany.totonos.jp')).toBe(
      'mycompany'
    );
    expect(extractCompanySlugFromEmail('sales@mycompany.totonos.jp')).toBe(
      'mycompany'
    );
  });

  it('is case insensitive', () => {
    expect(extractCompanySlugFromEmail('inbox@MyCompany.TOTONOS.JP')).toBe(
      'MyCompany'
    );
  });

  it('returns null for non-totonos.jp domain', () => {
    expect(extractCompanySlugFromEmail('inbox@acme.com')).toBeNull();
    expect(extractCompanySlugFromEmail('inbox@totonos.com')).toBeNull();
    expect(extractCompanySlugFromEmail('inbox@sub.totonos.com')).toBeNull();
  });

  it('returns null for direct totonos.jp (no subdomain)', () => {
    expect(extractCompanySlugFromEmail('inbox@totonos.jp')).toBeNull();
  });

  it('handles complex subdomains', () => {
    expect(extractCompanySlugFromEmail('inbox@my-company-123.totonos.jp')).toBe(
      'my-company-123'
    );
  });
});

describe('Integration: Full email parsing flow', () => {
  it('correctly parses and extracts company from Resend email', () => {
    const payload: ResendInboundEmail = {
      type: 'email.received',
      created_at: '2024-01-15T10:00:00Z',
      data: {
        email_id: 'msg-abc123',
        from: '株式会社テスト <info@test-corp.co.jp>',
        to: ['support@acme.totonos.jp'],
        cc: ['manager@acme.totonos.jp'],
        subject: '見積依頼について',
        text: '見積書を送付お願いします。',
        html: '<p>見積書を送付お願いします。</p>',
        reply_to: ['reply@test-corp.co.jp'],
      },
    };

    // Check Resend detection
    expect(isResendPayload(payload)).toBe(true);

    // Parse the email
    const parsed = parseResendEmail(payload);

    expect(parsed.fromEmail).toBe('info@test-corp.co.jp');
    expect(parsed.fromName).toBe('株式会社テスト');
    expect(parsed.toEmail).toBe('support@acme.totonos.jp');
    expect(parsed.subject).toBe('見積依頼について');
    expect(parsed.replyTo).toBe('reply@test-corp.co.jp');

    // Extract company
    const companySlug = extractCompanySlugFromEmail(parsed.toEmail);
    expect(companySlug).toBe('acme');
  });

  it('correctly parses SendGrid-style email', () => {
    const payload: InboundEmail = {
      from: '山田花子 <hanako@supplier.co.jp>',
      to: 'inbox@tech-startup.totonos.jp',
      cc: 'hanako@supplier.co.jp, tanaka@supplier.co.jp',
      subject: '納品書送付',
      text: '納品書を添付しております。',
      messageId: '<abc123@mail.supplier.co.jp>',
      headers: {
        'Message-ID': '<abc123@mail.supplier.co.jp>',
        'X-Mailer': 'Microsoft Outlook',
      },
    };

    // Not a Resend payload
    expect(isResendPayload(payload)).toBe(false);

    // Parse as generic
    const parsed = parseGenericEmail(payload);

    expect(parsed.fromEmail).toBe('hanako@supplier.co.jp');
    expect(parsed.fromName).toBe('山田花子');
    expect(parsed.toEmail).toBe('inbox@tech-startup.totonos.jp');
    expect(parsed.ccEmails).toHaveLength(2);
    expect(parsed.messageId).toBe('<abc123@mail.supplier.co.jp>');

    // Extract company
    const companySlug = extractCompanySlugFromEmail(parsed.toEmail);
    expect(companySlug).toBe('tech-startup');
  });
});
