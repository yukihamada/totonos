import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Invoice Form Integration', () => {
  describe('Invoice Item Management', () => {
    it('calculates item subtotal from quantity and price', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      interface InvoiceItem {
        description: string;
        quantity: number;
        unit_price: number;
      }

      const Component = () => {
        const [items, setItems] = useState<InvoiceItem[]>([
          { description: 'サービスA', quantity: 1, unit_price: 10000 },
        ]);

        const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
          const newItems = [...items];
          newItems[index] = { ...newItems[index], [field]: value };
          setItems(newItems);
        };

        const itemAmount = (item: InvoiceItem) => item.quantity * item.unit_price;

        return (
          <div>
            {items.map((item, i) => (
              <div key={i} data-testid={`item-${i}`}>
                <input
                  data-testid={`description-${i}`}
                  value={item.description}
                  onChange={(e) => updateItem(i, 'description', e.target.value)}
                />
                <input
                  data-testid={`quantity-${i}`}
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 0)}
                />
                <input
                  data-testid={`unit-price-${i}`}
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => updateItem(i, 'unit_price', parseInt(e.target.value) || 0)}
                />
                <span data-testid={`amount-${i}`}>¥{itemAmount(item).toLocaleString()}</span>
              </div>
            ))}
          </div>
        );
      };

      render(<Component />);

      // Initial state
      expect(screen.getByTestId('amount-0')).toHaveTextContent('¥10,000');

      // Update quantity
      await user.clear(screen.getByTestId('quantity-0'));
      await user.type(screen.getByTestId('quantity-0'), '3');

      expect(screen.getByTestId('amount-0')).toHaveTextContent('¥30,000');

      // Update unit price
      await user.clear(screen.getByTestId('unit-price-0'));
      await user.type(screen.getByTestId('unit-price-0'), '5000');

      expect(screen.getByTestId('amount-0')).toHaveTextContent('¥15,000');
    });

    it('calculates invoice total with multiple items', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      interface InvoiceItem {
        description: string;
        quantity: number;
        unit_price: number;
      }

      const Component = () => {
        const [items, setItems] = useState<InvoiceItem[]>([
          { description: 'サービスA', quantity: 2, unit_price: 10000 },
          { description: 'サービスB', quantity: 1, unit_price: 5000 },
        ]);

        const addItem = () => {
          setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
        };

        const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
          const newItems = [...items];
          newItems[index] = { ...newItems[index], [field]: value };
          setItems(newItems);
        };

        const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
        const tax = Math.floor(subtotal * 0.1);
        const total = subtotal + tax;

        return (
          <div>
            {items.map((item, i) => (
              <div key={i}>
                <input
                  data-testid={`quantity-${i}`}
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 0)}
                />
                <input
                  data-testid={`unit-price-${i}`}
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => updateItem(i, 'unit_price', parseInt(e.target.value) || 0)}
                />
              </div>
            ))}
            <button data-testid="add-item" onClick={addItem}>項目追加</button>
            <div data-testid="subtotal">小計: ¥{subtotal.toLocaleString()}</div>
            <div data-testid="tax">消費税: ¥{tax.toLocaleString()}</div>
            <div data-testid="total">合計: ¥{total.toLocaleString()}</div>
          </div>
        );
      };

      render(<Component />);

      // Initial totals (2 * 10000 + 1 * 5000 = 25000)
      expect(screen.getByTestId('subtotal')).toHaveTextContent('小計: ¥25,000');
      expect(screen.getByTestId('tax')).toHaveTextContent('消費税: ¥2,500');
      expect(screen.getByTestId('total')).toHaveTextContent('合計: ¥27,500');

      // Add new item
      await user.click(screen.getByTestId('add-item'));

      // Update new item
      await user.clear(screen.getByTestId('quantity-2'));
      await user.type(screen.getByTestId('quantity-2'), '5');
      await user.clear(screen.getByTestId('unit-price-2'));
      await user.type(screen.getByTestId('unit-price-2'), '2000');

      // New totals (25000 + 10000 = 35000)
      expect(screen.getByTestId('subtotal')).toHaveTextContent('小計: ¥35,000');
      expect(screen.getByTestId('tax')).toHaveTextContent('消費税: ¥3,500');
      expect(screen.getByTestId('total')).toHaveTextContent('合計: ¥38,500');
    });

    it('removes item and recalculates total', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      interface InvoiceItem {
        id: string;
        description: string;
        amount: number;
      }

      const Component = () => {
        const [items, setItems] = useState<InvoiceItem[]>([
          { id: '1', description: 'サービスA', amount: 10000 },
          { id: '2', description: 'サービスB', amount: 20000 },
          { id: '3', description: 'サービスC', amount: 30000 },
        ]);

        const removeItem = (id: string) => {
          setItems(items.filter(item => item.id !== id));
        };

        const total = items.reduce((sum, item) => sum + item.amount, 0);

        return (
          <div>
            {items.map((item) => (
              <div key={item.id} data-testid={`item-${item.id}`}>
                <span>{item.description}</span>
                <button data-testid={`remove-${item.id}`} onClick={() => removeItem(item.id)}>削除</button>
              </div>
            ))}
            <div data-testid="total">合計: ¥{total.toLocaleString()}</div>
            <div data-testid="item-count">件数: {items.length}</div>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('total')).toHaveTextContent('合計: ¥60,000');
      expect(screen.getByTestId('item-count')).toHaveTextContent('件数: 3');

      // Remove middle item
      await user.click(screen.getByTestId('remove-2'));

      expect(screen.getByTestId('total')).toHaveTextContent('合計: ¥40,000');
      expect(screen.getByTestId('item-count')).toHaveTextContent('件数: 2');
      expect(screen.queryByTestId('item-2')).not.toBeInTheDocument();
    });
  });

  describe('Invoice Status Transitions', () => {
    it('updates status from draft to sent', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

      const statusLabels: Record<InvoiceStatus, string> = {
        draft: '下書き',
        sent: '送信済み',
        paid: '支払済み',
        overdue: '期限超過',
      };

      const Component = () => {
        const [status, setStatus] = useState<InvoiceStatus>('draft');

        const sendInvoice = () => {
          if (status === 'draft') {
            setStatus('sent');
          }
        };

        const markAsPaid = () => {
          if (status === 'sent' || status === 'overdue') {
            setStatus('paid');
          }
        };

        return (
          <div>
            <span data-testid="status">{statusLabels[status]}</span>
            <button
              data-testid="send-button"
              onClick={sendInvoice}
              disabled={status !== 'draft'}
            >
              送信
            </button>
            <button
              data-testid="paid-button"
              onClick={markAsPaid}
              disabled={status !== 'sent' && status !== 'overdue'}
            >
              入金確認
            </button>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('status')).toHaveTextContent('下書き');
      expect(screen.getByTestId('send-button')).not.toBeDisabled();
      expect(screen.getByTestId('paid-button')).toBeDisabled();

      // Send invoice
      await user.click(screen.getByTestId('send-button'));

      expect(screen.getByTestId('status')).toHaveTextContent('送信済み');
      expect(screen.getByTestId('send-button')).toBeDisabled();
      expect(screen.getByTestId('paid-button')).not.toBeDisabled();

      // Mark as paid
      await user.click(screen.getByTestId('paid-button'));

      expect(screen.getByTestId('status')).toHaveTextContent('支払済み');
    });
  });

  describe('Client Selection', () => {
    it('displays selected client name', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      interface Client {
        id: string;
        name: string;
      }

      const Component = () => {
        const clients: Client[] = [
          { id: '1', name: '株式会社ABC' },
          { id: '2', name: '株式会社XYZ' },
          { id: '3', name: '有限会社テスト' },
        ];
        const [selectedClientId, setSelectedClientId] = useState('');

        const selectedClient = clients.find(c => c.id === selectedClientId);

        return (
          <div>
            <select
              data-testid="client-select"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
            >
              <option value="">取引先を選択</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            <div data-testid="selected-client">
              {selectedClient ? selectedClient.name : '未選択'}
            </div>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('selected-client')).toHaveTextContent('未選択');

      await user.selectOptions(screen.getByTestId('client-select'), '2');

      expect(screen.getByTestId('selected-client')).toHaveTextContent('株式会社XYZ');
    });
  });

  describe('Due Date Handling', () => {
    it('calculates days until due date', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      const Component = () => {
        const [dueDate, setDueDate] = useState('');

        const calculateDaysRemaining = () => {
          if (!dueDate) return null;
          const due = new Date(dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          due.setHours(0, 0, 0, 0);
          const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return diff;
        };

        const days = calculateDaysRemaining();
        const isOverdue = days !== null && days < 0;

        return (
          <div>
            <input
              data-testid="due-date-input"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            {days !== null && (
              <div data-testid="days-remaining" className={isOverdue ? 'overdue' : ''}>
                {isOverdue ? `${Math.abs(days)}日超過` : `残り${days}日`}
              </div>
            )}
          </div>
        );
      };

      render(<Component />);

      expect(screen.queryByTestId('days-remaining')).not.toBeInTheDocument();

      // Set due date to 10 days from now
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      await user.type(screen.getByTestId('due-date-input'), futureDateStr);

      expect(screen.getByTestId('days-remaining')).toHaveTextContent('残り10日');
    });

    it('shows overdue warning for past dates', async () => {
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      const Component = () => {
        const [dueDate] = useState('2020-01-01'); // Past date

        const due = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const isOverdue = diff < 0;

        return (
          <div>
            {isOverdue && <span data-testid="overdue-warning">期限超過</span>}
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('overdue-warning')).toBeInTheDocument();
    });
  });

  describe('Invoice Number Generation', () => {
    it('generates invoice number with prefix', () => {
      const generateInvoiceNumber = (prefix: string, sequence: number): string => {
        const year = new Date().getFullYear();
        const paddedSequence = sequence.toString().padStart(4, '0');
        return `${prefix}-${year}-${paddedSequence}`;
      };

      expect(generateInvoiceNumber('INV', 1)).toMatch(/^INV-\d{4}-0001$/);
      expect(generateInvoiceNumber('INV', 123)).toMatch(/^INV-\d{4}-0123$/);
      expect(generateInvoiceNumber('EST', 9999)).toMatch(/^EST-\d{4}-9999$/);
    });
  });

  describe('Form Submission State', () => {
    it('disables submit button while submitting', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      const Component = () => {
        const [isSubmitting, setIsSubmitting] = useState(false);

        const handleSubmit = async () => {
          setIsSubmitting(true);
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 100));
          setIsSubmitting(false);
        };

        return (
          <div>
            <button
              data-testid="submit-button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? '送信中...' : '送信'}
            </button>
          </div>
        );
      };

      render(<Component />);

      const button = screen.getByTestId('submit-button');
      expect(button).toHaveTextContent('送信');
      expect(button).not.toBeDisabled();

      await user.click(button);

      // Button should be disabled immediately after click
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('送信中...');
    });
  });

  describe('Currency Formatting', () => {
    it('formats numbers as Japanese Yen', () => {
      const formatCurrency = (amount: number): string => {
        return `¥${amount.toLocaleString('ja-JP')}`;
      };

      expect(formatCurrency(1000)).toBe('¥1,000');
      expect(formatCurrency(1000000)).toBe('¥1,000,000');
      expect(formatCurrency(0)).toBe('¥0');
      expect(formatCurrency(123456789)).toBe('¥123,456,789');
    });

    it('handles decimal amounts by flooring', () => {
      const formatCurrency = (amount: number): string => {
        return `¥${Math.floor(amount).toLocaleString('ja-JP')}`;
      };

      expect(formatCurrency(1000.5)).toBe('¥1,000');
      expect(formatCurrency(1000.99)).toBe('¥1,000');
    });
  });
});
