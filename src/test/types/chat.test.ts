import { describe, it, expect } from 'vitest';
import { QUICK_ACTIONS } from '@/types/chat';
import type { ChatMessage, ToolCall, ToolResult, QuickAction, ToolCategory } from '@/types/chat';

describe('Chat Types', () => {
  describe('QUICK_ACTIONS', () => {
    it('should have at least 5 quick actions', () => {
      expect(QUICK_ACTIONS.length).toBeGreaterThanOrEqual(5);
    });

    it('should have all required properties for each action', () => {
      QUICK_ACTIONS.forEach((action) => {
        expect(action).toHaveProperty('id');
        expect(action).toHaveProperty('label');
        expect(action).toHaveProperty('prompt');
        expect(action).toHaveProperty('category');
      });
    });

    it('should have unique ids', () => {
      const ids = QUICK_ACTIONS.map((a) => a.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('should include invoice action', () => {
      const invoiceAction = QUICK_ACTIONS.find(a => a.category === 'invoices');
      expect(invoiceAction).toBeDefined();
    });

    it('should include contract action', () => {
      const contractAction = QUICK_ACTIONS.find(a => a.category === 'contracts');
      expect(contractAction).toBeDefined();
    });

    it('should include CRM actions', () => {
      const crmActions = QUICK_ACTIONS.filter(a => a.category === 'crm');
      expect(crmActions.length).toBeGreaterThan(0);
    });
  });

  describe('ChatMessage type', () => {
    it('should allow valid message structure', () => {
      const message: ChatMessage = {
        id: 'test-1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
      };
      expect(message.id).toBe('test-1');
      expect(message.role).toBe('user');
    });

    it('should allow assistant role', () => {
      const message: ChatMessage = {
        id: 'test-2',
        role: 'assistant',
        content: 'Hi there!',
        timestamp: new Date(),
      };
      expect(message.role).toBe('assistant');
    });

    it('should allow optional toolCalls', () => {
      const toolCall: ToolCall = {
        id: 'tool-1',
        name: 'list_contracts',
        input: { limit: 10 },
      };
      const message: ChatMessage = {
        id: 'test-3',
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        toolCalls: [toolCall],
      };
      expect(message.toolCalls).toHaveLength(1);
    });
  });

  describe('ToolCategory type', () => {
    it('should include all expected categories', () => {
      const categories: ToolCategory[] = [
        'contracts',
        'crm',
        'accounting',
        'hr',
        'wiki',
        'it_assets',
        'invoices',
      ];
      expect(categories).toContain('contracts');
      expect(categories).toContain('invoices');
      expect(categories).toContain('crm');
    });
  });

  describe('ToolResult type', () => {
    it('should allow error results', () => {
      const result: ToolResult = {
        toolCallId: 'tool-1',
        toolName: 'list_contracts',
        result: { error: 'Something went wrong' },
        isError: true,
      };
      expect(result.isError).toBe(true);
    });

    it('should allow successful results', () => {
      const result: ToolResult = {
        toolCallId: 'tool-2',
        toolName: 'list_contracts',
        result: { contracts: [], count: 0 },
      };
      expect(result.isError).toBeUndefined();
    });
  });
});
