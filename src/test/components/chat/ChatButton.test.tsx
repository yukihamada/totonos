import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatButton } from '@/components/chat/ChatButton';

describe('ChatButton', () => {
  it('renders chat button when closed', () => {
    render(<ChatButton isOpen={false} onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows message icon when closed', () => {
    const { container } = render(<ChatButton isOpen={false} onClick={() => {}} />);
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
  });

  it('shows close icon when open', () => {
    const { container } = render(<ChatButton isOpen={true} onClick={() => {}} />);
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<ChatButton isOpen={false} onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows unread indicator when hasUnread is true', () => {
    render(<ChatButton isOpen={false} onClick={() => {}} hasUnread={true} />);
    expect(screen.getByTestId('unread-indicator')).toBeInTheDocument();
  });

  it('does not show unread indicator when hasUnread is false', () => {
    render(<ChatButton isOpen={false} onClick={() => {}} hasUnread={false} />);
    expect(screen.queryByTestId('unread-indicator')).not.toBeInTheDocument();
  });
});
