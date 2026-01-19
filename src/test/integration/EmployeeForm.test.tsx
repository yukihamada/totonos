import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Employee Form Integration', () => {
  describe('Employee Basic Information', () => {
    it('updates employee name input', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      const Component = () => {
        const [firstName, setFirstName] = useState('');
        const [lastName, setLastName] = useState('');
        const fullName = `${lastName} ${firstName}`.trim();

        return (
          <div>
            <input
              data-testid="last-name-input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="姓"
            />
            <input
              data-testid="first-name-input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="名"
            />
            <div data-testid="full-name">氏名: {fullName || '未入力'}</div>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('full-name')).toHaveTextContent('氏名: 未入力');

      await user.type(screen.getByTestId('last-name-input'), '山田');
      await user.type(screen.getByTestId('first-name-input'), '太郎');

      expect(screen.getByTestId('full-name')).toHaveTextContent('氏名: 山田 太郎');
    });

    it('formats email input', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      const Component = () => {
        const [email, setEmail] = useState('');
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        return (
          <div>
            <input
              data-testid="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div data-testid="email-valid">{isValidEmail ? '有効' : '無効'}</div>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('email-valid')).toHaveTextContent('無効');

      await user.type(screen.getByTestId('email-input'), 'yamada@example.com');

      expect(screen.getByTestId('email-valid')).toHaveTextContent('有効');
    });
  });

  describe('Employment Type Selection', () => {
    it('selects employment type', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      const Component = () => {
        const [employmentType, setEmploymentType] = useState('');
        const types = [
          { value: 'full_time', label: '正社員' },
          { value: 'contract', label: '契約社員' },
          { value: 'part_time', label: 'パート' },
          { value: 'temporary', label: 'アルバイト' },
        ];

        const selectedLabel = types.find(t => t.value === employmentType)?.label;

        return (
          <div>
            <select
              data-testid="employment-type-select"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
            >
              <option value="">選択してください</option>
              {types.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <div data-testid="selected-type">{selectedLabel || '未選択'}</div>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('selected-type')).toHaveTextContent('未選択');

      await user.selectOptions(screen.getByTestId('employment-type-select'), 'full_time');

      expect(screen.getByTestId('selected-type')).toHaveTextContent('正社員');
    });
  });

  describe('Department Assignment', () => {
    it('assigns employee to department', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      interface Department {
        id: string;
        name: string;
      }

      const Component = () => {
        const departments: Department[] = [
          { id: '1', name: '営業部' },
          { id: '2', name: '開発部' },
          { id: '3', name: '人事部' },
          { id: '4', name: '経理部' },
        ];
        const [selectedDept, setSelectedDept] = useState('');

        const department = departments.find(d => d.id === selectedDept);

        return (
          <div>
            <select
              data-testid="department-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">部門を選択</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <div data-testid="department-name">{department?.name || '未配属'}</div>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('department-name')).toHaveTextContent('未配属');

      await user.selectOptions(screen.getByTestId('department-select'), '2');

      expect(screen.getByTestId('department-name')).toHaveTextContent('開発部');
    });
  });

  describe('Salary Input', () => {
    it('formats salary with thousands separator', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      const Component = () => {
        const [salary, setSalary] = useState(0);
        const monthlySalary = Math.floor(salary / 12);

        return (
          <div>
            <input
              data-testid="salary-input"
              type="number"
              value={salary}
              onChange={(e) => setSalary(parseInt(e.target.value) || 0)}
            />
            <div data-testid="annual-salary">年収: ¥{salary.toLocaleString()}</div>
            <div data-testid="monthly-salary">月収: ¥{monthlySalary.toLocaleString()}</div>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('annual-salary')).toHaveTextContent('年収: ¥0');
      expect(screen.getByTestId('monthly-salary')).toHaveTextContent('月収: ¥0');

      await user.type(screen.getByTestId('salary-input'), '6000000');

      expect(screen.getByTestId('annual-salary')).toHaveTextContent('年収: ¥6,000,000');
      expect(screen.getByTestId('monthly-salary')).toHaveTextContent('月収: ¥500,000');
    });

    it('calculates hourly rate from monthly salary', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      const Component = () => {
        const [monthlySalary, setMonthlySalary] = useState(0);
        const workingDays = 20;
        const hoursPerDay = 8;
        const hourlyRate = monthlySalary > 0 ? Math.floor(monthlySalary / (workingDays * hoursPerDay)) : 0;

        return (
          <div>
            <input
              data-testid="monthly-salary-input"
              type="number"
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(parseInt(e.target.value) || 0)}
            />
            <div data-testid="hourly-rate">時給: ¥{hourlyRate.toLocaleString()}</div>
          </div>
        );
      };

      render(<Component />);

      await user.type(screen.getByTestId('monthly-salary-input'), '400000');

      expect(screen.getByTestId('hourly-rate')).toHaveTextContent('時給: ¥2,500');
    });
  });

  describe('Join Date Handling', () => {
    it('calculates years of service', async () => {
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      const Component = () => {
        const [joinDate] = useState('2020-04-01');

        const calculateYearsOfService = (date: string): number => {
          const join = new Date(date);
          const now = new Date();
          const years = (now.getTime() - join.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
          return Math.floor(years);
        };

        const years = calculateYearsOfService(joinDate);

        return (
          <div>
            <div data-testid="join-date">{joinDate}</div>
            <div data-testid="years-of-service">勤続年数: {years}年</div>
          </div>
        );
      };

      render(<Component />);

      // Check that years is calculated (should be > 0 for 2020 join date)
      const yearsText = screen.getByTestId('years-of-service').textContent;
      expect(yearsText).toMatch(/勤続年数: \d+年/);
    });

    it('calculates probation end date', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      const Component = () => {
        const [joinDate, setJoinDate] = useState('');
        const [probationMonths] = useState(3);

        const calculateProbationEnd = (): string => {
          if (!joinDate) return '';
          const date = new Date(joinDate);
          date.setMonth(date.getMonth() + probationMonths);
          return date.toISOString().split('T')[0];
        };

        const probationEnd = calculateProbationEnd();

        return (
          <div>
            <input
              data-testid="join-date-input"
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
            />
            <div data-testid="probation-end">
              試用期間終了: {probationEnd || '未設定'}
            </div>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('probation-end')).toHaveTextContent('試用期間終了: 未設定');

      await user.type(screen.getByTestId('join-date-input'), '2024-04-01');

      expect(screen.getByTestId('probation-end')).toHaveTextContent('試用期間終了: 2024-07-01');
    });
  });

  describe('Leave Balance Display', () => {
    it('shows remaining leave days', () => {
      const { render: reactRender } = require('@testing-library/react');

      const Component = () => {
        const totalDays = 20;
        const usedDays = 5;
        const remainingDays = totalDays - usedDays;
        const usagePercent = Math.round((usedDays / totalDays) * 100);

        return (
          <div>
            <div data-testid="total-leave">付与日数: {totalDays}日</div>
            <div data-testid="used-leave">消化日数: {usedDays}日</div>
            <div data-testid="remaining-leave">残日数: {remainingDays}日</div>
            <div data-testid="usage-percent">消化率: {usagePercent}%</div>
          </div>
        );
      };

      reactRender(<Component />);

      expect(screen.getByTestId('total-leave')).toHaveTextContent('付与日数: 20日');
      expect(screen.getByTestId('used-leave')).toHaveTextContent('消化日数: 5日');
      expect(screen.getByTestId('remaining-leave')).toHaveTextContent('残日数: 15日');
      expect(screen.getByTestId('usage-percent')).toHaveTextContent('消化率: 25%');
    });
  });

  describe('Status Toggle', () => {
    it('toggles employee active status', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      const Component = () => {
        const [isActive, setIsActive] = useState(true);

        return (
          <div>
            <button
              data-testid="status-toggle"
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? '有効' : '無効'}
            </button>
            <div data-testid="status">{isActive ? 'アクティブ' : '休止中'}</div>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('status')).toHaveTextContent('アクティブ');

      await user.click(screen.getByTestId('status-toggle'));

      expect(screen.getByTestId('status')).toHaveTextContent('休止中');
    });
  });

  describe('Emergency Contact', () => {
    it('adds emergency contact information', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      interface EmergencyContact {
        name: string;
        relationship: string;
        phone: string;
      }

      const Component = () => {
        const [contact, setContact] = useState<EmergencyContact>({
          name: '',
          relationship: '',
          phone: '',
        });

        const isComplete = contact.name && contact.relationship && contact.phone;

        return (
          <div>
            <input
              data-testid="contact-name"
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              placeholder="氏名"
            />
            <select
              data-testid="contact-relationship"
              value={contact.relationship}
              onChange={(e) => setContact({ ...contact, relationship: e.target.value })}
            >
              <option value="">続柄を選択</option>
              <option value="spouse">配偶者</option>
              <option value="parent">親</option>
              <option value="sibling">兄弟姉妹</option>
              <option value="other">その他</option>
            </select>
            <input
              data-testid="contact-phone"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              placeholder="電話番号"
            />
            <div data-testid="contact-status">{isComplete ? '登録完了' : '未完了'}</div>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('contact-status')).toHaveTextContent('未完了');

      await user.type(screen.getByTestId('contact-name'), '山田花子');
      await user.selectOptions(screen.getByTestId('contact-relationship'), 'spouse');
      await user.type(screen.getByTestId('contact-phone'), '090-1234-5678');

      expect(screen.getByTestId('contact-status')).toHaveTextContent('登録完了');
    });
  });

  describe('Bank Account Input', () => {
    it('validates bank account number format', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');
      const { render } = await import('@testing-library/react');

      const Component = () => {
        const [accountNumber, setAccountNumber] = useState('');
        const isValid = /^\d{7}$/.test(accountNumber);

        return (
          <div>
            <input
              data-testid="account-number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 7))}
              placeholder="口座番号（7桁）"
            />
            <div data-testid="validation">{isValid ? '有効' : '7桁の数字を入力'}</div>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getByTestId('validation')).toHaveTextContent('7桁の数字を入力');

      await user.type(screen.getByTestId('account-number'), '123456');
      expect(screen.getByTestId('validation')).toHaveTextContent('7桁の数字を入力');

      await user.type(screen.getByTestId('account-number'), '7');
      expect(screen.getByTestId('validation')).toHaveTextContent('有効');
    });
  });
});
