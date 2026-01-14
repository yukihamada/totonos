import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from './ChatInput';

describe('ChatInput', () => {
  const mockOnSend = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders textarea and send button', () => {
    render(<ChatInput onSend={mockOnSend} />);

    expect(screen.getByPlaceholderText(/メッセージを入力/)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('updates input value when typing', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText(/メッセージを入力/);
    await user.type(textarea, 'Hello');

    expect(textarea).toHaveValue('Hello');
  });

  it('calls onSend when clicking send button', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText(/メッセージを入力/);
    await user.type(textarea, 'Test message');
    await user.click(screen.getByRole('button'));

    expect(mockOnSend).toHaveBeenCalledWith('Test message');
    expect(textarea).toHaveValue('');
  });

  it('sends message on Enter key (without IME composition)', async () => {
    render(<ChatInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText(/メッセージを入力/);

    // Type a message
    fireEvent.change(textarea, { target: { value: 'Test message' } });

    // Simulate Enter key without IME composition
    fireEvent.keyDown(textarea, {
      key: 'Enter',
      code: 'Enter',
      shiftKey: false,
      nativeEvent: { isComposing: false },
    });

    expect(mockOnSend).toHaveBeenCalledWith('Test message');
  });

  it('does NOT send message during IME composition (isComposing: true)', () => {
    render(<ChatInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText(/メッセージを入力/);

    // Type a message
    fireEvent.change(textarea, { target: { value: 'こんにちは' } });

    // Simulate Enter key DURING IME composition
    // This happens when confirming Japanese input conversion
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      bubbles: true,
    });
    // Mark as composing
    Object.defineProperty(event, 'isComposing', { value: true });
    Object.defineProperty(event, 'nativeEvent', {
      value: { isComposing: true },
    });

    textarea.dispatchEvent(event);

    // Should NOT call onSend because IME is composing
    expect(mockOnSend).not.toHaveBeenCalled();
    // Message should remain in the input
    expect(textarea).toHaveValue('こんにちは');
  });

  it('allows newline with Shift+Enter', () => {
    render(<ChatInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText(/メッセージを入力/);

    fireEvent.change(textarea, { target: { value: 'Line 1' } });

    // Simulate Shift+Enter
    fireEvent.keyDown(textarea, {
      key: 'Enter',
      code: 'Enter',
      shiftKey: true,
      nativeEvent: { isComposing: false },
    });

    // Should NOT call onSend (Shift+Enter should add newline, not send)
    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('disables input when isLoading is true', () => {
    render(<ChatInput onSend={mockOnSend} isLoading={true} />);

    const textarea = screen.getByPlaceholderText(/メッセージを入力/);
    const button = screen.getByRole('button');

    expect(textarea).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('disables input when disabled prop is true', () => {
    render(<ChatInput onSend={mockOnSend} disabled={true} />);

    const textarea = screen.getByPlaceholderText(/メッセージを入力/);
    const button = screen.getByRole('button');

    expect(textarea).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('does not send empty or whitespace-only messages', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText(/メッセージを入力/);
    const button = screen.getByRole('button');

    // Empty input - button should be disabled
    expect(button).toBeDisabled();

    // Whitespace only
    await user.type(textarea, '   ');
    expect(button).toBeDisabled();
  });

  it('trims whitespace from messages before sending', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText(/メッセージを入力/);

    await user.type(textarea, '  Hello World  ');
    await user.click(screen.getByRole('button'));

    expect(mockOnSend).toHaveBeenCalledWith('Hello World');
  });

  it('shows loading spinner when isLoading is true', () => {
    render(<ChatInput onSend={mockOnSend} isLoading={true} />);

    // The button should contain a loader (Loader2 icon with animate-spin)
    const button = screen.getByRole('button');
    const loader = button.querySelector('.animate-spin');
    expect(loader).toBeInTheDocument();
  });

  it('shows AI disclaimer text', () => {
    render(<ChatInput onSend={mockOnSend} />);

    expect(screen.getByText(/AIは間違える可能性があります/)).toBeInTheDocument();
  });
});
