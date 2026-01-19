import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Lead Form Integration', () => {
  describe('Lead Basic Information', () => {
    it('updates lead company and contact name', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      const Component = () => {
        const [companyName, setCompanyName] = useState('');
        const [contactName, setContactName] = useState('');

        return (
          <div>
            <input
              data-testid="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="会社名"
            />
            <input
              data-testid="contact-name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="担当者名"
            />
            <div data-testid="display">
              {companyName ? `${companyName}（${contactName || '担当者未設定'}）` : '未入力'}
            </div>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('display')).toHaveTextContent('未入力');

      await user.type(screen.getByTestId('company-name'), '株式会社テスト');
      await user.type(screen.getByTestId('contact-name'), '田中太郎');

      expect(screen.getByTestId('display')).toHaveTextContent('株式会社テスト（田中太郎）');
    });
  });

  describe('Lead Status Selection', () => {
    it('selects lead status and shows color indicator', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

      const statusConfig: Record<LeadStatus, { label: string; color: string }> = {
        new: { label: '新規', color: 'blue' },
        contacted: { label: '連絡済み', color: 'yellow' },
        qualified: { label: '見込み', color: 'green' },
        proposal: { label: '提案中', color: 'purple' },
        negotiation: { label: '交渉中', color: 'orange' },
        closed_won: { label: '成約', color: 'green' },
        closed_lost: { label: '失注', color: 'red' },
      };

      const Component = () => {
        const [status, setStatus] = useState<LeadStatus>('new');

        return (
          <div>
            <select
              data-testid="status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
            >
              {Object.entries(statusConfig).map(([value, config]) => (
                <option key={value} value={value}>{config.label}</option>
              ))}
            </select>
            <div data-testid="status-label">{statusConfig[status].label}</div>
            <div data-testid="status-color">{statusConfig[status].color}</div>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('status-label')).toHaveTextContent('新規');
      expect(screen.getByTestId('status-color')).toHaveTextContent('blue');

      await user.selectOptions(screen.getByTestId('status-select'), 'qualified');

      expect(screen.getByTestId('status-label')).toHaveTextContent('見込み');
      expect(screen.getByTestId('status-color')).toHaveTextContent('green');
    });
  });

  describe('Lead Score Calculation', () => {
    it('calculates lead score based on inputs', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      const Component = () => {
        const [hasWebsite, setHasWebsite] = useState(false);
        const [hasPhone, setHasPhone] = useState(false);
        const [hasEmail, setHasEmail] = useState(false);
        const [companySize, setCompanySize] = useState('');

        const calculateScore = (): number => {
          let score = 0;
          if (hasWebsite) score += 10;
          if (hasPhone) score += 20;
          if (hasEmail) score += 15;
          if (companySize === 'large') score += 30;
          else if (companySize === 'medium') score += 20;
          else if (companySize === 'small') score += 10;
          return score;
        };

        const score = calculateScore();
        const rating = score >= 50 ? '高' : score >= 25 ? '中' : '低';

        return (
          <div>
            <label>
              <input
                data-testid="has-website"
                type="checkbox"
                checked={hasWebsite}
                onChange={(e) => setHasWebsite(e.target.checked)}
              />
              Webサイトあり (+10)
            </label>
            <label>
              <input
                data-testid="has-phone"
                type="checkbox"
                checked={hasPhone}
                onChange={(e) => setHasPhone(e.target.checked)}
              />
              電話番号あり (+20)
            </label>
            <label>
              <input
                data-testid="has-email"
                type="checkbox"
                checked={hasEmail}
                onChange={(e) => setHasEmail(e.target.checked)}
              />
              メールあり (+15)
            </label>
            <select
              data-testid="company-size"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
            >
              <option value="">会社規模</option>
              <option value="small">小規模 (+10)</option>
              <option value="medium">中規模 (+20)</option>
              <option value="large">大規模 (+30)</option>
            </select>
            <div data-testid="score">スコア: {score}</div>
            <div data-testid="rating">評価: {rating}</div>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('score')).toHaveTextContent('スコア: 0');
      expect(screen.getByTestId('rating')).toHaveTextContent('評価: 低');

      await user.click(screen.getByTestId('has-website'));
      await user.click(screen.getByTestId('has-phone'));
      await user.click(screen.getByTestId('has-email'));

      expect(screen.getByTestId('score')).toHaveTextContent('スコア: 45');
      expect(screen.getByTestId('rating')).toHaveTextContent('評価: 中');

      await user.selectOptions(screen.getByTestId('company-size'), 'large');

      expect(screen.getByTestId('score')).toHaveTextContent('スコア: 75');
      expect(screen.getByTestId('rating')).toHaveTextContent('評価: 高');
    });
  });

  describe('Lead Source Tracking', () => {
    it('tracks lead source selection', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      const Component = () => {
        const sources = [
          { value: 'website', label: 'Webサイト' },
          { value: 'referral', label: '紹介' },
          { value: 'advertisement', label: '広告' },
          { value: 'event', label: 'イベント' },
          { value: 'cold_call', label: '電話営業' },
          { value: 'other', label: 'その他' },
        ];
        const [source, setSource] = useState('');

        return (
          <div>
            <select
              data-testid="source-select"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="">リードソースを選択</option>
              {sources.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <div data-testid="selected-source">
              {sources.find(s => s.value === source)?.label || '未選択'}
            </div>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('selected-source')).toHaveTextContent('未選択');

      await user.selectOptions(screen.getByTestId('source-select'), 'referral');

      expect(screen.getByTestId('selected-source')).toHaveTextContent('紹介');
    });
  });
});

describe('Deal Form Integration', () => {
  describe('Deal Amount Input', () => {
    it('updates deal amount with formatting', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      const Component = () => {
        const [amount, setAmount] = useState(0);

        return (
          <div>
            <input
              data-testid="amount-input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
            />
            <div data-testid="formatted-amount">¥{amount.toLocaleString()}</div>
          </div>
        );
      };

      render(<Component />);

      await user.type(screen.getByTestId('amount-input'), '1500000');

      expect(screen.getByTestId('formatted-amount')).toHaveTextContent('¥1,500,000');
    });
  });

  describe('Deal Probability', () => {
    it('updates probability and expected value', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      const Component = () => {
        const [amount, setAmount] = useState(1000000);
        const [probability, setProbability] = useState(50);
        const expectedValue = Math.floor(amount * (probability / 100));

        return (
          <div>
            <input
              data-testid="amount-input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
            />
            <input
              data-testid="probability-input"
              type="range"
              min="0"
              max="100"
              value={probability}
              onChange={(e) => setProbability(parseInt(e.target.value))}
            />
            <div data-testid="probability-display">確度: {probability}%</div>
            <div data-testid="expected-value">期待値: ¥{expectedValue.toLocaleString()}</div>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('probability-display')).toHaveTextContent('確度: 50%');
      expect(screen.getByTestId('expected-value')).toHaveTextContent('期待値: ¥500,000');

      // Change probability using fireEvent (range inputs don't support user.clear)
      const rangeInput = screen.getByTestId('probability-input');
      const { fireEvent } = await import('@testing-library/react');
      fireEvent.change(rangeInput, { target: { value: '80' } });

      expect(screen.getByTestId('probability-display')).toHaveTextContent('確度: 80%');
      expect(screen.getByTestId('expected-value')).toHaveTextContent('期待値: ¥800,000');
    });
  });

  describe('Deal Stage Pipeline', () => {
    it('moves deal through pipeline stages', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      type DealStage = 'lead' | 'discovery' | 'proposal' | 'negotiation' | 'closed';

      const stages: { value: DealStage; label: string; probability: number }[] = [
        { value: 'lead', label: 'リード', probability: 10 },
        { value: 'discovery', label: 'ヒアリング', probability: 25 },
        { value: 'proposal', label: '提案', probability: 50 },
        { value: 'negotiation', label: '交渉', probability: 75 },
        { value: 'closed', label: '成約', probability: 100 },
      ];

      const Component = () => {
        const [currentStage, setCurrentStage] = useState<DealStage>('lead');
        const stageIndex = stages.findIndex(s => s.value === currentStage);
        const currentStageInfo = stages[stageIndex];

        const moveToNextStage = () => {
          if (stageIndex < stages.length - 1) {
            setCurrentStage(stages[stageIndex + 1].value);
          }
        };

        const moveToPrevStage = () => {
          if (stageIndex > 0) {
            setCurrentStage(stages[stageIndex - 1].value);
          }
        };

        return (
          <div>
            <div data-testid="current-stage">{currentStageInfo.label}</div>
            <div data-testid="stage-probability">確度: {currentStageInfo.probability}%</div>
            <button
              data-testid="prev-stage"
              onClick={moveToPrevStage}
              disabled={stageIndex === 0}
            >
              前のステージ
            </button>
            <button
              data-testid="next-stage"
              onClick={moveToNextStage}
              disabled={stageIndex === stages.length - 1}
            >
              次のステージ
            </button>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('current-stage')).toHaveTextContent('リード');
      expect(screen.getByTestId('stage-probability')).toHaveTextContent('確度: 10%');
      expect(screen.getByTestId('prev-stage')).toBeDisabled();

      await user.click(screen.getByTestId('next-stage'));
      expect(screen.getByTestId('current-stage')).toHaveTextContent('ヒアリング');
      expect(screen.getByTestId('stage-probability')).toHaveTextContent('確度: 25%');

      await user.click(screen.getByTestId('next-stage'));
      await user.click(screen.getByTestId('next-stage'));
      expect(screen.getByTestId('current-stage')).toHaveTextContent('交渉');

      await user.click(screen.getByTestId('next-stage'));
      expect(screen.getByTestId('current-stage')).toHaveTextContent('成約');
      expect(screen.getByTestId('next-stage')).toBeDisabled();
    });
  });

  describe('Close Date Input', () => {
    it('validates close date is in the future', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      const Component = () => {
        const [closeDate, setCloseDate] = useState('');

        const isValidDate = () => {
          if (!closeDate) return null;
          const date = new Date(closeDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date >= today;
        };

        const valid = isValidDate();

        return (
          <div>
            <input
              data-testid="close-date"
              type="date"
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
            />
            {valid !== null && (
              <div data-testid="date-validation">
                {valid ? '有効な日付' : '過去の日付です'}
              </div>
            )}
          </div>
        );
      };

      render(<Component />);

      expect(screen.queryByTestId('date-validation')).not.toBeInTheDocument();

      // Set future date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      await user.type(screen.getByTestId('close-date'), futureDate.toISOString().split('T')[0]);

      expect(screen.getByTestId('date-validation')).toHaveTextContent('有効な日付');
    });
  });

  describe('Deal Tags', () => {
    it('adds and removes tags', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      const Component = () => {
        const [tags, setTags] = useState<string[]>(['重要', '急ぎ']);
        const [newTag, setNewTag] = useState('');

        const addTag = () => {
          if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
            setNewTag('');
          }
        };

        const removeTag = (tag: string) => {
          setTags(tags.filter(t => t !== tag));
        };

        return (
          <div>
            <input
              data-testid="tag-input"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
            />
            <button data-testid="add-tag" onClick={addTag}>追加</button>
            <div data-testid="tags">
              {tags.map(tag => (
                <span key={tag} data-testid={`tag-${tag}`}>
                  {tag}
                  <button data-testid={`remove-${tag}`} onClick={() => removeTag(tag)}>×</button>
                </span>
              ))}
            </div>
            <div data-testid="tag-count">タグ数: {tags.length}</div>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('tag-count')).toHaveTextContent('タグ数: 2');
      expect(screen.getByTestId('tag-重要')).toBeInTheDocument();

      // Add new tag
      await user.type(screen.getByTestId('tag-input'), '大口');
      await user.click(screen.getByTestId('add-tag'));

      expect(screen.getByTestId('tag-count')).toHaveTextContent('タグ数: 3');
      expect(screen.getByTestId('tag-大口')).toBeInTheDocument();

      // Remove tag
      await user.click(screen.getByTestId('remove-急ぎ'));

      expect(screen.getByTestId('tag-count')).toHaveTextContent('タグ数: 2');
      expect(screen.queryByTestId('tag-急ぎ')).not.toBeInTheDocument();
    });
  });

  describe('Deal Owner Assignment', () => {
    it('assigns deal to team member', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      interface TeamMember {
        id: string;
        name: string;
        avatar: string;
      }

      const Component = () => {
        const members: TeamMember[] = [
          { id: '1', name: '田中太郎', avatar: 'T' },
          { id: '2', name: '山田花子', avatar: 'Y' },
          { id: '3', name: '佐藤次郎', avatar: 'S' },
        ];
        const [ownerId, setOwnerId] = useState('');

        const owner = members.find(m => m.id === ownerId);

        return (
          <div>
            <select
              data-testid="owner-select"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
            >
              <option value="">担当者を選択</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <div data-testid="owner-display">
              {owner ? `担当: ${owner.name}` : '担当者未設定'}
            </div>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('owner-display')).toHaveTextContent('担当者未設定');

      await user.selectOptions(screen.getByTestId('owner-select'), '2');

      expect(screen.getByTestId('owner-display')).toHaveTextContent('担当: 山田花子');
    });
  });

  describe('Product Selection', () => {
    it('selects products and calculates total', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      interface Product {
        id: string;
        name: string;
        price: number;
      }

      const Component = () => {
        const products: Product[] = [
          { id: '1', name: '基本プラン', price: 100000 },
          { id: '2', name: 'プレミアムプラン', price: 200000 },
          { id: '3', name: 'オプションA', price: 50000 },
        ];
        const [selectedIds, setSelectedIds] = useState<string[]>([]);

        const toggleProduct = (id: string) => {
          setSelectedIds(prev =>
            prev.includes(id)
              ? prev.filter(i => i !== id)
              : [...prev, id]
          );
        };

        const total = selectedIds.reduce((sum, id) => {
          const product = products.find(p => p.id === id);
          return sum + (product?.price || 0);
        }, 0);

        return (
          <div>
            {products.map(p => (
              <label key={p.id}>
                <input
                  data-testid={`product-${p.id}`}
                  type="checkbox"
                  checked={selectedIds.includes(p.id)}
                  onChange={() => toggleProduct(p.id)}
                />
                {p.name} (¥{p.price.toLocaleString()})
              </label>
            ))}
            <div data-testid="selected-count">選択数: {selectedIds.length}</div>
            <div data-testid="total">合計: ¥{total.toLocaleString()}</div>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('selected-count')).toHaveTextContent('選択数: 0');
      expect(screen.getByTestId('total')).toHaveTextContent('合計: ¥0');

      await user.click(screen.getByTestId('product-1'));
      await user.click(screen.getByTestId('product-3'));

      expect(screen.getByTestId('selected-count')).toHaveTextContent('選択数: 2');
      expect(screen.getByTestId('total')).toHaveTextContent('合計: ¥150,000');
    });
  });

  describe('Notes/Activity Log', () => {
    it('adds note to deal', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      interface Note {
        id: string;
        content: string;
        timestamp: Date;
      }

      const Component = () => {
        const [notes, setNotes] = useState<Note[]>([]);
        const [newNote, setNewNote] = useState('');

        const addNote = () => {
          if (newNote.trim()) {
            setNotes([
              ...notes,
              { id: Date.now().toString(), content: newNote, timestamp: new Date() },
            ]);
            setNewNote('');
          }
        };

        return (
          <div>
            <textarea
              data-testid="note-input"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="メモを入力"
            />
            <button data-testid="add-note" onClick={addNote}>追加</button>
            <div data-testid="notes-list">
              {notes.map(note => (
                <div key={note.id} data-testid={`note-${note.id}`}>
                  {note.content}
                </div>
              ))}
            </div>
            <div data-testid="note-count">メモ数: {notes.length}</div>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('note-count')).toHaveTextContent('メモ数: 0');

      await user.type(screen.getByTestId('note-input'), '初回商談完了');
      await user.click(screen.getByTestId('add-note'));

      expect(screen.getByTestId('note-count')).toHaveTextContent('メモ数: 1');

      await user.type(screen.getByTestId('note-input'), '見積書送付済み');
      await user.click(screen.getByTestId('add-note'));

      expect(screen.getByTestId('note-count')).toHaveTextContent('メモ数: 2');
    });
  });
});
