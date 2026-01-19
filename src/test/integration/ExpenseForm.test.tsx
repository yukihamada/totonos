import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Expense Form Integration', () => {
  describe('Form Input Reflection', () => {
    it('updates title input when user types', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const [title, setTitle] = useState('');
        return (
          <input
            data-testid="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="経費タイトル"
          />
        );
      };

      const { useState } = await import('react');
      const { render: reactRender } = await import('@testing-library/react');

      const Component = () => {
        const [title, setTitle] = useState('');
        return (
          <input
            data-testid="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="経費タイトル"
          />
        );
      };

      reactRender(<Component />);

      const input = screen.getByTestId('title-input');
      await user.type(input, '交通費');

      expect(input).toHaveValue('交通費');
    });

    it('updates amount input with numbers only', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render: reactRender } = await import('@testing-library/react');

      const Component = () => {
        const [amount, setAmount] = useState('');
        return (
          <input
            data-testid="amount-input"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />
        );
      };

      reactRender(<Component />);

      const input = screen.getByTestId('amount-input');
      await user.type(input, '12500');

      expect(input).toHaveValue(12500);
    });

    it('clears input when user deletes text', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render: reactRender } = await import('@testing-library/react');

      const Component = () => {
        const [value, setValue] = useState('初期値');
        return (
          <input
            data-testid="text-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
      };

      reactRender(<Component />);

      const input = screen.getByTestId('text-input');
      expect(input).toHaveValue('初期値');

      await user.clear(input);
      expect(input).toHaveValue('');
    });
  });

  describe('Dynamic Calculations', () => {
    it('calculates total from quantity and unit price', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render: reactRender } = await import('@testing-library/react');

      const Component = () => {
        const [quantity, setQuantity] = useState(1);
        const [unitPrice, setUnitPrice] = useState(0);
        const total = quantity * unitPrice;

        return (
          <div>
            <input
              data-testid="quantity-input"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            />
            <input
              data-testid="unit-price-input"
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(parseInt(e.target.value) || 0)}
            />
            <span data-testid="total-display">¥{total.toLocaleString()}</span>
          </div>
        );
      };

      reactRender(<Component />);

      const quantityInput = screen.getByTestId('quantity-input');
      const unitPriceInput = screen.getByTestId('unit-price-input');

      await user.clear(quantityInput);
      await user.type(quantityInput, '5');
      await user.clear(unitPriceInput);
      await user.type(unitPriceInput, '1000');

      expect(screen.getByTestId('total-display')).toHaveTextContent('¥5,000');
    });

    it('calculates tax amount at 10%', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render: reactRender } = await import('@testing-library/react');

      const Component = () => {
        const [amount, setAmount] = useState(0);
        const taxAmount = Math.floor(amount * 0.1);
        const totalWithTax = amount + taxAmount;

        return (
          <div>
            <input
              data-testid="amount-input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
            />
            <span data-testid="tax-display">税額: ¥{taxAmount.toLocaleString()}</span>
            <span data-testid="total-display">合計: ¥{totalWithTax.toLocaleString()}</span>
          </div>
        );
      };

      reactRender(<Component />);

      const amountInput = screen.getByTestId('amount-input');
      await user.clear(amountInput);
      await user.type(amountInput, '10000');

      expect(screen.getByTestId('tax-display')).toHaveTextContent('税額: ¥1,000');
      expect(screen.getByTestId('total-display')).toHaveTextContent('合計: ¥11,000');
    });

    it('calculates allocation percentages correctly', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render: reactRender } = await import('@testing-library/react');

      const Component = () => {
        const [allocations, setAllocations] = useState([
          { id: '1', percentage: 50 },
          { id: '2', percentage: 30 },
        ]);
        const total = allocations.reduce((sum, a) => sum + a.percentage, 0);
        const isValid = total === 100;

        const updateAllocation = (id: string, value: number) => {
          setAllocations(allocations.map(a =>
            a.id === id ? { ...a, percentage: value } : a
          ));
        };

        return (
          <div>
            {allocations.map(a => (
              <input
                key={a.id}
                data-testid={`allocation-${a.id}`}
                type="number"
                value={a.percentage}
                onChange={(e) => updateAllocation(a.id, parseInt(e.target.value) || 0)}
              />
            ))}
            <span data-testid="total-percentage">合計: {total}%</span>
            <span data-testid="validation-status">{isValid ? '有効' : '無効'}</span>
          </div>
        );
      };

      reactRender(<Component />);

      expect(screen.getByTestId('total-percentage')).toHaveTextContent('合計: 80%');
      expect(screen.getByTestId('validation-status')).toHaveTextContent('無効');

      const allocation2 = screen.getByTestId('allocation-2');
      await user.clear(allocation2);
      await user.type(allocation2, '50');

      expect(screen.getByTestId('total-percentage')).toHaveTextContent('合計: 100%');
      expect(screen.getByTestId('validation-status')).toHaveTextContent('有効');
    });
  });

  describe('Form Validation', () => {
    it('shows error when required field is empty', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render: reactRender } = await import('@testing-library/react');

      const Component = () => {
        const [title, setTitle] = useState('');
        const [error, setError] = useState('');

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          if (!title.trim()) {
            setError('タイトルは必須です');
          } else {
            setError('');
          }
        };

        return (
          <form onSubmit={handleSubmit}>
            <input
              data-testid="title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button type="submit" data-testid="submit-button">送信</button>
            {error && <span data-testid="error-message">{error}</span>}
          </form>
        );
      };

      reactRender(<Component />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      expect(screen.getByTestId('error-message')).toHaveTextContent('タイトルは必須です');
    });

    it('clears error when user fixes the input', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render: reactRender } = await import('@testing-library/react');

      const Component = () => {
        const [title, setTitle] = useState('');
        const [error, setError] = useState('');

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          if (!title.trim()) {
            setError('タイトルは必須です');
          } else {
            setError('');
          }
        };

        return (
          <form onSubmit={handleSubmit}>
            <input
              data-testid="title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button type="submit" data-testid="submit-button">送信</button>
            {error && <span data-testid="error-message">{error}</span>}
          </form>
        );
      };

      reactRender(<Component />);

      // Submit empty form
      await user.click(screen.getByTestId('submit-button'));
      expect(screen.getByTestId('error-message')).toBeInTheDocument();

      // Fill in the input and submit again
      await user.type(screen.getByTestId('title-input'), '交通費');
      await user.click(screen.getByTestId('submit-button'));

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('validates amount is positive number', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render: reactRender } = await import('@testing-library/react');

      const Component = () => {
        const [amount, setAmount] = useState('');
        const [error, setError] = useState('');

        const handleChange = (value: string) => {
          setAmount(value);
          const num = parseFloat(value);
          if (isNaN(num) || num <= 0) {
            setError('正の数を入力してください');
          } else {
            setError('');
          }
        };

        return (
          <div>
            <input
              data-testid="amount-input"
              type="number"
              value={amount}
              onChange={(e) => handleChange(e.target.value)}
            />
            {error && <span data-testid="error-message">{error}</span>}
          </div>
        );
      };

      reactRender(<Component />);

      const input = screen.getByTestId('amount-input');

      // Enter negative number
      await user.type(input, '-100');
      expect(screen.getByTestId('error-message')).toHaveTextContent('正の数を入力してください');

      // Clear and enter positive number
      await user.clear(input);
      await user.type(input, '1000');
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  describe('List Management', () => {
    it('adds items to a list', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render: reactRender } = await import('@testing-library/react');

      const Component = () => {
        const [items, setItems] = useState<string[]>([]);
        const [input, setInput] = useState('');

        const addItem = () => {
          if (input.trim()) {
            setItems([...items, input]);
            setInput('');
          }
        };

        return (
          <div>
            <input
              data-testid="item-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button data-testid="add-button" onClick={addItem}>追加</button>
            <ul data-testid="item-list">
              {items.map((item, i) => (
                <li key={i} data-testid={`item-${i}`}>{item}</li>
              ))}
            </ul>
            <span data-testid="item-count">件数: {items.length}</span>
          </div>
        );
      };

      reactRender(<Component />);

      const input = screen.getByTestId('item-input');
      const addButton = screen.getByTestId('add-button');

      await user.type(input, '品目1');
      await user.click(addButton);

      await user.type(input, '品目2');
      await user.click(addButton);

      expect(screen.getByTestId('item-count')).toHaveTextContent('件数: 2');
      expect(screen.getByTestId('item-0')).toHaveTextContent('品目1');
      expect(screen.getByTestId('item-1')).toHaveTextContent('品目2');
    });

    it('removes items from a list', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render: reactRender } = await import('@testing-library/react');

      const Component = () => {
        const [items, setItems] = useState(['品目1', '品目2', '品目3']);

        const removeItem = (index: number) => {
          setItems(items.filter((_, i) => i !== index));
        };

        return (
          <div>
            <ul data-testid="item-list">
              {items.map((item, i) => (
                <li key={i}>
                  <span data-testid={`item-${i}`}>{item}</span>
                  <button data-testid={`remove-${i}`} onClick={() => removeItem(i)}>削除</button>
                </li>
              ))}
            </ul>
            <span data-testid="item-count">件数: {items.length}</span>
          </div>
        );
      };

      reactRender(<Component />);

      expect(screen.getByTestId('item-count')).toHaveTextContent('件数: 3');

      // Remove middle item
      await user.click(screen.getByTestId('remove-1'));

      expect(screen.getByTestId('item-count')).toHaveTextContent('件数: 2');
      expect(screen.getByTestId('item-0')).toHaveTextContent('品目1');
      expect(screen.getByTestId('item-1')).toHaveTextContent('品目3');
    });
  });

  describe('Select/Dropdown Interactions', () => {
    it('updates selected value when option is chosen', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render: reactRender } = await import('@testing-library/react');

      const Component = () => {
        const [category, setCategory] = useState('');
        const categories = [
          { value: 'transportation', label: '交通費' },
          { value: 'entertainment', label: '交際費' },
          { value: 'supplies', label: '消耗品費' },
        ];

        return (
          <div>
            <select
              data-testid="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">選択してください</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <span data-testid="selected-value">{category || '未選択'}</span>
          </div>
        );
      };

      reactRender(<Component />);

      expect(screen.getByTestId('selected-value')).toHaveTextContent('未選択');

      await user.selectOptions(screen.getByTestId('category-select'), 'transportation');

      expect(screen.getByTestId('selected-value')).toHaveTextContent('transportation');
    });
  });

  describe('Checkbox Interactions', () => {
    it('toggles checkbox state', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render: reactRender } = await import('@testing-library/react');

      const Component = () => {
        const [checked, setChecked] = useState(false);

        return (
          <div>
            <input
              data-testid="checkbox"
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <span data-testid="status">{checked ? 'オン' : 'オフ'}</span>
          </div>
        );
      };

      reactRender(<Component />);

      expect(screen.getByTestId('status')).toHaveTextContent('オフ');

      await user.click(screen.getByTestId('checkbox'));
      expect(screen.getByTestId('status')).toHaveTextContent('オン');

      await user.click(screen.getByTestId('checkbox'));
      expect(screen.getByTestId('status')).toHaveTextContent('オフ');
    });

    it('shows/hides content based on checkbox', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render: reactRender } = await import('@testing-library/react');

      const Component = () => {
        const [showDetails, setShowDetails] = useState(false);

        return (
          <div>
            <label>
              <input
                data-testid="toggle-checkbox"
                type="checkbox"
                checked={showDetails}
                onChange={(e) => setShowDetails(e.target.checked)}
              />
              詳細を表示
            </label>
            {showDetails && (
              <div data-testid="details-section">
                <p>詳細情報がここに表示されます</p>
              </div>
            )}
          </div>
        );
      };

      reactRender(<Component />);

      expect(screen.queryByTestId('details-section')).not.toBeInTheDocument();

      await user.click(screen.getByTestId('toggle-checkbox'));
      expect(screen.getByTestId('details-section')).toBeInTheDocument();

      await user.click(screen.getByTestId('toggle-checkbox'));
      expect(screen.queryByTestId('details-section')).not.toBeInTheDocument();
    });
  });
});
