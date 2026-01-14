import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatMessage } from './ChatMessage';
import type { ChatMessage as ChatMessageType } from '@/types/chat';

// Mock ToolResultCard
vi.mock('./ToolResultCard', () => ({
  ToolResultCard: ({ result }: { result: { toolCallId: string } }) => (
    <div data-testid={`tool-result-${result.toolCallId}`}>Tool Result</div>
  ),
}));

describe('ChatMessage', () => {
  const baseMessage: ChatMessageType = {
    id: 'msg-1',
    role: 'user',
    content: 'Hello',
    timestamp: new Date('2024-01-15T10:00:00Z'),
  };

  it('renders user message correctly', () => {
    const message: ChatMessageType = {
      ...baseMessage,
      role: 'user',
      content: 'Hello, this is a test message',
    };

    render(<ChatMessage message={message} />);

    expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
  });

  it('renders assistant message correctly', () => {
    const message: ChatMessageType = {
      ...baseMessage,
      role: 'assistant',
      content: 'Hello, how can I help you?',
    };

    render(<ChatMessage message={message} />);

    expect(screen.getByText('Hello, how can I help you?')).toBeInTheDocument();
  });

  it('renders timestamp correctly', () => {
    const testDate = new Date();
    testDate.setHours(14, 30, 0, 0); // Use local time to avoid timezone issues

    const message: ChatMessageType = {
      ...baseMessage,
      timestamp: testDate,
    };

    render(<ChatMessage message={message} />);

    // Timestamp format: HH:mm - should show local time
    expect(screen.getByText(/14:30/)).toBeInTheDocument();
  });

  it('renders Markdown bold text in assistant message', () => {
    const message: ChatMessageType = {
      ...baseMessage,
      role: 'assistant',
      content: 'This is **bold** text',
    };

    render(<ChatMessage message={message} />);

    const boldElement = screen.getByText('bold');
    expect(boldElement.tagName).toBe('STRONG');
  });

  it('renders Markdown italic text in assistant message', () => {
    const message: ChatMessageType = {
      ...baseMessage,
      role: 'assistant',
      content: 'This is *italic* text',
    };

    render(<ChatMessage message={message} />);

    const italicElement = screen.getByText('italic');
    expect(italicElement.tagName).toBe('EM');
  });

  it('renders Markdown code blocks in assistant message', () => {
    const message: ChatMessageType = {
      ...baseMessage,
      role: 'assistant',
      content: '```javascript\nconst x = 1;\n```',
    };

    render(<ChatMessage message={message} />);

    expect(screen.getByText(/const x = 1/)).toBeInTheDocument();
  });

  it('renders Markdown inline code in assistant message', () => {
    const message: ChatMessageType = {
      ...baseMessage,
      role: 'assistant',
      content: 'Use the `console.log()` function',
    };

    render(<ChatMessage message={message} />);

    const codeElement = screen.getByText('console.log()');
    expect(codeElement.tagName).toBe('CODE');
  });

  it('renders Markdown links in assistant message', () => {
    const message: ChatMessageType = {
      ...baseMessage,
      role: 'assistant',
      content: 'Visit [Google](https://google.com) for more',
    };

    render(<ChatMessage message={message} />);

    const link = screen.getByRole('link', { name: 'Google' });
    expect(link).toHaveAttribute('href', 'https://google.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders Markdown lists in assistant message', () => {
    const message: ChatMessageType = {
      ...baseMessage,
      role: 'assistant',
      content: '- Item 1\n- Item 2\n- Item 3',
    };

    render(<ChatMessage message={message} />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('renders Markdown numbered lists in assistant message', () => {
    const message: ChatMessageType = {
      ...baseMessage,
      role: 'assistant',
      content: '1. First\n2. Second\n3. Third',
    };

    render(<ChatMessage message={message} />);

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('renders Markdown headings in assistant message', () => {
    const message: ChatMessageType = {
      ...baseMessage,
      role: 'assistant',
      content: '## This is a heading',
    };

    render(<ChatMessage message={message} />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('This is a heading');
  });

  it('does NOT render Markdown in user messages (plain text)', () => {
    const message: ChatMessageType = {
      ...baseMessage,
      role: 'user',
      content: 'This is **not bold** in user message',
    };

    render(<ChatMessage message={message} />);

    // User messages should show raw text with asterisks
    expect(screen.getByText('This is **not bold** in user message')).toBeInTheDocument();
  });

  it('renders tool calls when present', () => {
    const message: ChatMessageType = {
      ...baseMessage,
      role: 'assistant',
      content: '',
      toolCalls: [
        { id: 'tc-1', name: 'search_documents', input: {} },
        { id: 'tc-2', name: 'calculate_revenue', input: {} },
      ],
    };

    render(<ChatMessage message={message} />);

    expect(screen.getByText(/search_documents を実行中/)).toBeInTheDocument();
    expect(screen.getByText(/calculate_revenue を実行中/)).toBeInTheDocument();
  });

  it('renders tool results when present', () => {
    const message: ChatMessageType = {
      ...baseMessage,
      role: 'assistant',
      content: '',
      toolResults: [
        { toolCallId: 'tc-1', toolName: 'search', result: { count: 5 } },
      ],
    };

    render(<ChatMessage message={message} />);

    expect(screen.getByTestId('tool-result-tc-1')).toBeInTheDocument();
  });

  it('applies streaming animation when isStreaming is true', () => {
    const message: ChatMessageType = {
      ...baseMessage,
      role: 'assistant',
      content: 'Streaming...',
      isStreaming: true,
    };

    render(<ChatMessage message={message} />);

    // The message container should have animate-pulse class
    const content = screen.getByText('Streaming...');
    expect(content.closest('.animate-pulse')).toBeInTheDocument();
  });

  it('renders user message with correct styling', () => {
    const message: ChatMessageType = {
      ...baseMessage,
      role: 'user',
      content: 'User message',
    };

    render(<ChatMessage message={message} />);

    const messageContainer = screen.getByText('User message').closest('.rounded-lg');
    expect(messageContainer).toHaveClass('bg-primary');
  });

  it('renders assistant message with correct styling', () => {
    const message: ChatMessageType = {
      ...baseMessage,
      role: 'assistant',
      content: 'Assistant message',
    };

    render(<ChatMessage message={message} />);

    const messageContainer = screen.getByText('Assistant message').closest('.rounded-lg');
    expect(messageContainer).toHaveClass('bg-muted');
  });

  it('renders GFM tables correctly', () => {
    const message: ChatMessageType = {
      ...baseMessage,
      role: 'assistant',
      content: '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |',
    };

    render(<ChatMessage message={message} />);

    expect(screen.getByText('Header 1')).toBeInTheDocument();
    expect(screen.getByText('Cell 1')).toBeInTheDocument();
  });

  it('handles empty content gracefully', () => {
    const message: ChatMessageType = {
      ...baseMessage,
      role: 'assistant',
      content: '',
    };

    // Should not throw
    expect(() => render(<ChatMessage message={message} />)).not.toThrow();
  });

  it('preserves whitespace in user messages', () => {
    const message: ChatMessageType = {
      ...baseMessage,
      role: 'user',
      content: 'Line 1\nLine 2\nLine 3',
    };

    render(<ChatMessage message={message} />);

    const messageElement = screen.getByText(/Line 1/);
    expect(messageElement).toHaveClass('whitespace-pre-wrap');
  });
});
