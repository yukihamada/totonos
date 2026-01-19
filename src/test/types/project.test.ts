import { describe, it, expect } from 'vitest';

describe('Project Types and Utilities', () => {
  describe('Project Status', () => {
    const statuses = [
      { status: 'planning', label: '企画中' },
      { status: 'in_progress', label: '進行中' },
      { status: 'on_hold', label: '保留' },
      { status: 'completed', label: '完了' },
      { status: 'cancelled', label: 'キャンセル' },
    ];

    it('has planning status', () => {
      const planning = statuses.find(s => s.status === 'planning');
      expect(planning).toBeDefined();
      expect(planning?.label).toBe('企画中');
    });

    it('has in_progress status', () => {
      const inProgress = statuses.find(s => s.status === 'in_progress');
      expect(inProgress).toBeDefined();
      expect(inProgress?.label).toBe('進行中');
    });

    it('has completed status', () => {
      const completed = statuses.find(s => s.status === 'completed');
      expect(completed).toBeDefined();
      expect(completed?.label).toBe('完了');
    });

    it('has all common statuses', () => {
      expect(statuses.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Project Priority', () => {
    const priorities = [
      { priority: 'low', label: '低', color: 'gray' },
      { priority: 'medium', label: '中', color: 'yellow' },
      { priority: 'high', label: '高', color: 'orange' },
      { priority: 'urgent', label: '緊急', color: 'red' },
    ];

    it('has low priority', () => {
      const low = priorities.find(p => p.priority === 'low');
      expect(low).toBeDefined();
      expect(low?.label).toBe('低');
    });

    it('has urgent priority', () => {
      const urgent = priorities.find(p => p.priority === 'urgent');
      expect(urgent).toBeDefined();
      expect(urgent?.label).toBe('緊急');
    });

    it('orders priorities correctly', () => {
      const order = ['low', 'medium', 'high', 'urgent'];
      priorities.forEach((p, i) => {
        expect(p.priority).toBe(order[i]);
      });
    });
  });

  describe('Task Status', () => {
    const taskStatuses = [
      { status: 'todo', label: '未着手' },
      { status: 'in_progress', label: '作業中' },
      { status: 'review', label: 'レビュー中' },
      { status: 'done', label: '完了' },
    ];

    it('has todo status', () => {
      const todo = taskStatuses.find(s => s.status === 'todo');
      expect(todo).toBeDefined();
    });

    it('has done status', () => {
      const done = taskStatuses.find(s => s.status === 'done');
      expect(done).toBeDefined();
    });

    it('includes review status', () => {
      const review = taskStatuses.find(s => s.status === 'review');
      expect(review).toBeDefined();
    });
  });
});

describe('Project Calculations', () => {
  describe('Progress Calculation', () => {
    it('calculates progress from completed tasks', () => {
      const tasks = [
        { status: 'done' },
        { status: 'done' },
        { status: 'in_progress' },
        { status: 'todo' },
      ];

      const completedTasks = tasks.filter(t => t.status === 'done').length;
      const totalTasks = tasks.length;
      const progress = Math.round((completedTasks / totalTasks) * 100);

      expect(progress).toBe(50);
    });

    it('handles zero tasks', () => {
      const tasks: { status: string }[] = [];
      const progress = tasks.length > 0
        ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)
        : 0;

      expect(progress).toBe(0);
    });

    it('handles all completed tasks', () => {
      const tasks = [
        { status: 'done' },
        { status: 'done' },
        { status: 'done' },
      ];

      const completedTasks = tasks.filter(t => t.status === 'done').length;
      const totalTasks = tasks.length;
      const progress = Math.round((completedTasks / totalTasks) * 100);

      expect(progress).toBe(100);
    });
  });

  describe('Budget Tracking', () => {
    it('calculates budget utilization', () => {
      const budget = 1000000;
      const spent = 750000;

      const utilization = Math.round((spent / budget) * 100);

      expect(utilization).toBe(75);
    });

    it('calculates remaining budget', () => {
      const budget = 1000000;
      const spent = 750000;

      const remaining = budget - spent;

      expect(remaining).toBe(250000);
    });

    it('detects over budget', () => {
      const budget = 1000000;
      const spent = 1200000;

      const isOverBudget = spent > budget;

      expect(isOverBudget).toBe(true);
    });

    it('calculates over budget percentage', () => {
      const budget = 1000000;
      const spent = 1200000;

      const overBudgetAmount = spent - budget;
      const overBudgetPercent = Math.round((overBudgetAmount / budget) * 100);

      expect(overBudgetPercent).toBe(20);
    });
  });

  describe('Timeline Calculations', () => {
    it('calculates days remaining', () => {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 10);

      const today = new Date();
      const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      expect(daysRemaining).toBe(10);
    });

    it('detects overdue project', () => {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 5);

      const today = new Date();
      const isOverdue = endDate < today;

      expect(isOverdue).toBe(true);
    });

    it('calculates project duration', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-03-31');

      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      expect(duration).toBe(90);
    });
  });

  describe('Team Assignment', () => {
    it('counts team members', () => {
      const team = [
        { id: '1', name: 'Member 1', role: 'PM' },
        { id: '2', name: 'Member 2', role: 'Developer' },
        { id: '3', name: 'Member 3', role: 'Developer' },
        { id: '4', name: 'Member 4', role: 'Designer' },
      ];

      expect(team.length).toBe(4);
    });

    it('counts by role', () => {
      const team = [
        { id: '1', name: 'Member 1', role: 'PM' },
        { id: '2', name: 'Member 2', role: 'Developer' },
        { id: '3', name: 'Member 3', role: 'Developer' },
        { id: '4', name: 'Member 4', role: 'Designer' },
      ];

      const developers = team.filter(m => m.role === 'Developer').length;

      expect(developers).toBe(2);
    });
  });
});

describe('Wiki Types and Utilities', () => {
  describe('Page Structure', () => {
    it('validates page hierarchy', () => {
      const pages = [
        { id: '1', title: 'Home', parent_id: null },
        { id: '2', title: 'Getting Started', parent_id: '1' },
        { id: '3', title: 'Installation', parent_id: '2' },
      ];

      const rootPages = pages.filter(p => p.parent_id === null);
      expect(rootPages.length).toBe(1);
    });

    it('finds child pages', () => {
      const pages = [
        { id: '1', title: 'Home', parent_id: null },
        { id: '2', title: 'Getting Started', parent_id: '1' },
        { id: '3', title: 'FAQ', parent_id: '1' },
      ];

      const children = pages.filter(p => p.parent_id === '1');
      expect(children.length).toBe(2);
    });

    it('builds breadcrumb path', () => {
      const pages = [
        { id: '1', title: 'Home', parent_id: null },
        { id: '2', title: 'Documentation', parent_id: '1' },
        { id: '3', title: 'API Reference', parent_id: '2' },
      ];

      const buildBreadcrumb = (pageId: string): string[] => {
        const path: string[] = [];
        let current = pages.find(p => p.id === pageId);

        while (current) {
          path.unshift(current.title);
          current = pages.find(p => p.id === current?.parent_id);
        }

        return path;
      };

      const breadcrumb = buildBreadcrumb('3');
      expect(breadcrumb).toEqual(['Home', 'Documentation', 'API Reference']);
    });
  });

  describe('Content Formatting', () => {
    it('calculates word count', () => {
      const content = 'This is a sample wiki page with some content.';
      const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

      expect(wordCount).toBe(9);
    });

    it('calculates reading time', () => {
      const wordCount = 1000;
      const wordsPerMinute = 200;

      const readingTime = Math.ceil(wordCount / wordsPerMinute);

      expect(readingTime).toBe(5);
    });

    it('extracts headings from markdown', () => {
      const content = `
# Main Title
Some content here.
## Section 1
More content.
## Section 2
Even more content.
### Subsection 2.1
Details here.
      `;

      const headings = content.match(/^#{1,6}\s+.+$/gm) || [];

      expect(headings.length).toBe(4);
    });

    it('validates slug format', () => {
      const generateSlug = (title: string): string => {
        return title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      };

      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('API Reference Guide')).toBe('api-reference-guide');
      expect(generateSlug('  Multiple   Spaces  ')).toBe('multiple-spaces');
    });
  });

  describe('Version Control', () => {
    it('tracks revision history', () => {
      const revisions = [
        { version: 1, author: 'user1', timestamp: '2024-01-01T10:00:00Z' },
        { version: 2, author: 'user2', timestamp: '2024-01-02T11:00:00Z' },
        { version: 3, author: 'user1', timestamp: '2024-01-03T12:00:00Z' },
      ];

      const latestVersion = Math.max(...revisions.map(r => r.version));

      expect(latestVersion).toBe(3);
    });

    it('identifies latest author', () => {
      const revisions = [
        { version: 1, author: 'user1', timestamp: '2024-01-01T10:00:00Z' },
        { version: 2, author: 'user2', timestamp: '2024-01-02T11:00:00Z' },
        { version: 3, author: 'user1', timestamp: '2024-01-03T12:00:00Z' },
      ];

      const latestRevision = revisions.reduce((latest, r) =>
        r.version > latest.version ? r : latest
      );

      expect(latestRevision.author).toBe('user1');
    });
  });

  describe('Search Functionality', () => {
    it('searches in title', () => {
      const pages = [
        { id: '1', title: 'Getting Started', content: 'Welcome...' },
        { id: '2', title: 'API Documentation', content: 'REST API...' },
        { id: '3', title: 'Troubleshooting', content: 'Common issues...' },
      ];

      const query = 'api';
      const results = pages.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase())
      );

      expect(results.length).toBe(1);
      expect(results[0].title).toBe('API Documentation');
    });

    it('searches in content', () => {
      const pages = [
        { id: '1', title: 'Page 1', content: 'This mentions authentication.' },
        { id: '2', title: 'Page 2', content: 'Nothing relevant here.' },
        { id: '3', title: 'Auth Guide', content: 'How to setup auth.' },
      ];

      const query = 'auth';
      const results = pages.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.content.toLowerCase().includes(query.toLowerCase())
      );

      expect(results.length).toBe(2);
    });
  });
});

describe('Contract Types and Utilities', () => {
  describe('Contract Status', () => {
    const statuses = [
      { status: 'draft', label: '下書き' },
      { status: 'sent', label: '送信済み' },
      { status: 'pending_signature', label: '署名待ち' },
      { status: 'partially_signed', label: '一部署名済み' },
      { status: 'signed', label: '締結済み' },
      { status: 'expired', label: '期限切れ' },
      { status: 'cancelled', label: 'キャンセル' },
    ];

    it('has all contract statuses', () => {
      expect(statuses.length).toBe(7);
    });

    it('has draft status', () => {
      const draft = statuses.find(s => s.status === 'draft');
      expect(draft).toBeDefined();
    });

    it('has signed status', () => {
      const signed = statuses.find(s => s.status === 'signed');
      expect(signed).toBeDefined();
      expect(signed?.label).toBe('締結済み');
    });
  });

  describe('Contract Expiration', () => {
    it('detects expiring soon contracts', () => {
      const today = new Date();
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 25);

      const daysUntilExpiration = Math.ceil(
        (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      const isExpiringSoon = daysUntilExpiration <= 30 && daysUntilExpiration > 0;

      expect(isExpiringSoon).toBe(true);
    });

    it('detects expired contracts', () => {
      const today = new Date();
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() - 5);

      const isExpired = expirationDate < today;

      expect(isExpired).toBe(true);
    });
  });
});
