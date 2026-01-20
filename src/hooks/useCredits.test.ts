import { describe, it, expect } from 'vitest';
import {
  PLANS,
  CREDIT_COSTS,
  CHARGE_PACKS,
} from './useCredits';

describe('PLANS', () => {
  it('should have correct plan definitions', () => {
    expect(PLANS.free.monthlyCredits).toBe(100);
    expect(PLANS.starter.monthlyCredits).toBe(500);
    expect(PLANS.standard.monthlyCredits).toBe(2000);
    expect(PLANS.pro.monthlyCredits).toBe(10000);
    expect(PLANS.enterprise.monthlyCredits).toBe(Infinity);
  });

  it('should have correct pricing', () => {
    expect(PLANS.free.price).toBe(0);
    expect(PLANS.starter.price).toBe(980);
    expect(PLANS.standard.price).toBe(2980);
    expect(PLANS.pro.price).toBe(9800);
  });

  it('should have all required plan properties', () => {
    Object.values(PLANS).forEach((plan) => {
      expect(plan).toHaveProperty('name');
      expect(plan).toHaveProperty('price');
      expect(plan).toHaveProperty('monthlyCredits');
      expect(typeof plan.name).toBe('string');
      expect(typeof plan.price).toBe('number');
      expect(typeof plan.monthlyCredits).toBe('number');
    });
  });

  it('should have enterprise plan with unlimited credits', () => {
    expect(PLANS.enterprise.monthlyCredits).toBe(Infinity);
  });

  it('should have free plan with no cost', () => {
    expect(PLANS.free.price).toBe(0);
  });

  it('should have increasing credits with higher tier plans', () => {
    expect(PLANS.starter.monthlyCredits).toBeGreaterThan(PLANS.free.monthlyCredits);
    expect(PLANS.standard.monthlyCredits).toBeGreaterThan(PLANS.starter.monthlyCredits);
    expect(PLANS.pro.monthlyCredits).toBeGreaterThan(PLANS.standard.monthlyCredits);
  });
});

describe('CREDIT_COSTS', () => {
  it('should have correct cost definitions for basic actions', () => {
    expect(CREDIT_COSTS.ai_chat.cost).toBe(1);
    expect(CREDIT_COSTS.ai_forecast.cost).toBe(5);
    expect(CREDIT_COSTS.ai_scoring.cost).toBe(3);
    expect(CREDIT_COSTS.ocr.cost).toBe(2);
    expect(CREDIT_COSTS.pdf.cost).toBe(1);
    expect(CREDIT_COSTS.email.cost).toBe(1);
  });

  it('should have correct cost definitions for new actions', () => {
    expect(CREDIT_COSTS.ocr_delivery_note.cost).toBe(3);
    expect(CREDIT_COSTS.lead_scoring.cost).toBe(2);
    expect(CREDIT_COSTS.barcode_lookup.cost).toBe(0);
  });

  it('should have correct cost definitions for AI chat variants', () => {
    expect(CREDIT_COSTS.ai_chat.cost).toBe(1);
    expect(CREDIT_COSTS.ai_chat_image.cost).toBe(3);
    expect(CREDIT_COSTS.ai_chat_pdf.cost).toBe(5);
  });

  it('should have correct cost definitions for email actions', () => {
    expect(CREDIT_COSTS.ai_email_analysis.cost).toBe(2);
    expect(CREDIT_COSTS.ai_email_reply.cost).toBe(3);
    expect(CREDIT_COSTS.ai_email_command.cost).toBe(5);
  });

  it('should have correct cost definitions for contract actions', () => {
    expect(CREDIT_COSTS.contract_create.cost).toBe(3);
    expect(CREDIT_COSTS.contract_sign.cost).toBe(2);
    expect(CREDIT_COSTS.contract_blockchain.cost).toBe(5);
  });

  it('should have names for all actions', () => {
    Object.values(CREDIT_COSTS).forEach((action) => {
      expect(action.name).toBeTruthy();
      expect(typeof action.cost).toBe('number');
      // barcode_lookup is free, so cost >= 0
      expect(action.cost).toBeGreaterThanOrEqual(0);
    });
  });

  it('should have all expected action types', () => {
    const expectedActions = [
      // Basic
      'ai_chat',
      'ai_chat_image',
      'ai_chat_pdf',
      // Email
      'ai_email_analysis',
      'ai_email_reply',
      'ai_email_command',
      // Documents
      'ai_document_generate',
      'ocr',
      'ocr_delivery_note',
      'pdf',
      // Email & Export
      'email',
      'export',
      // Contracts
      'contract_create',
      'contract_sign',
      'contract_blockchain',
      // AI Analysis
      'ai_forecast',
      'ai_scoring',
      'lead_scoring',
      // Others
      'mcp_call',
      'barcode_lookup',
    ];
    expectedActions.forEach((action) => {
      expect(CREDIT_COSTS).toHaveProperty(action);
    });
  });

  it('should have barcode_lookup as free action', () => {
    expect(CREDIT_COSTS.barcode_lookup.cost).toBe(0);
    expect(CREDIT_COSTS.barcode_lookup.name).toBe('バーコード検索');
  });

  it('should have total of 20 action types', () => {
    expect(Object.keys(CREDIT_COSTS).length).toBe(20);
  });
});

describe('CHARGE_PACKS', () => {
  it('should have correct number of packs', () => {
    expect(CHARGE_PACKS).toHaveLength(4);
  });

  it('should have correct pack definitions', () => {
    const pack100 = CHARGE_PACKS.find((p) => p.id === 'pack_100');
    expect(pack100?.credits).toBe(100);
    expect(pack100?.price).toBe(500);

    const pack500 = CHARGE_PACKS.find((p) => p.id === 'pack_500');
    expect(pack500?.credits).toBe(500);
    expect(pack500?.price).toBe(2000);

    const pack1000 = CHARGE_PACKS.find((p) => p.id === 'pack_1000');
    expect(pack1000?.credits).toBe(1000);
    expect(pack1000?.price).toBe(3500);

    const pack5000 = CHARGE_PACKS.find((p) => p.id === 'pack_5000');
    expect(pack5000?.credits).toBe(5000);
    expect(pack5000?.price).toBe(15000);
  });

  it('should have increasing discounts for larger packs', () => {
    const sortedPacks = [...CHARGE_PACKS].sort((a, b) => a.credits - b.credits);
    for (let i = 1; i < sortedPacks.length; i++) {
      expect(sortedPacks[i].discount).toBeGreaterThanOrEqual(
        sortedPacks[i - 1].discount
      );
    }
  });

  it('should have decreasing price per credit for larger packs', () => {
    const sortedPacks = [...CHARGE_PACKS].sort((a, b) => a.credits - b.credits);
    for (let i = 1; i < sortedPacks.length; i++) {
      expect(sortedPacks[i].pricePerCredit).toBeLessThanOrEqual(
        sortedPacks[i - 1].pricePerCredit
      );
    }
  });

  it('should have all required pack properties', () => {
    CHARGE_PACKS.forEach((pack) => {
      expect(pack).toHaveProperty('id');
      expect(pack).toHaveProperty('credits');
      expect(pack).toHaveProperty('price');
      expect(pack).toHaveProperty('pricePerCredit');
      expect(pack).toHaveProperty('discount');
    });
  });

  it('should calculate price per credit correctly', () => {
    CHARGE_PACKS.forEach((pack) => {
      const calculatedPricePerCredit = pack.price / pack.credits;
      expect(pack.pricePerCredit).toBeCloseTo(calculatedPricePerCredit, 1);
    });
  });

  it('should have valid discount percentages', () => {
    CHARGE_PACKS.forEach((pack) => {
      expect(pack.discount).toBeGreaterThanOrEqual(0);
      expect(pack.discount).toBeLessThanOrEqual(100);
    });
  });
});
