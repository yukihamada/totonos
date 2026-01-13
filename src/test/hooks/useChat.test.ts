import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat } from '@/hooks/useChat';

// Mock the chat API
vi.mock('@/lib/chat-api', () => ({
  sendChatMessage: vi.fn().mockResolvedValue({
    id: 'response-1',
    role: 'assistant',
    content: 'Test response',
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty messages', () => {
    const { result } = renderHook(() => useChat());
    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should add user message when sendMessage is called', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    // Should have user message and assistant response
    expect(result.current.messages.length).toBeGreaterThan(0);
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[0].content).toBe('Hello');
  });

  it('should not send empty messages', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('');
    });

    expect(result.current.messages).toHaveLength(0);
  });

  it('should not send whitespace-only messages', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('   ');
    });

    expect(result.current.messages).toHaveLength(0);
  });

  it('should clear messages when clearMessages is called', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.messages.length).toBeGreaterThan(0);

    act(() => {
      result.current.clearMessages();
    });

    expect(result.current.messages).toHaveLength(0);
  });

  it('should have addMessage function', () => {
    const { result } = renderHook(() => useChat());
    expect(typeof result.current.addMessage).toBe('function');
  });

  it('should have updateMessage function', () => {
    const { result } = renderHook(() => useChat());
    expect(typeof result.current.updateMessage).toBe('function');
  });

  it('should have regenerate function', () => {
    const { result } = renderHook(() => useChat());
    expect(typeof result.current.regenerate).toBe('function');
  });

  it('should add message with generated id and timestamp', () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.addMessage({
        role: 'user',
        content: 'Test message',
      });
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].id).toBeDefined();
    expect(result.current.messages[0].timestamp).toBeDefined();
  });
});
