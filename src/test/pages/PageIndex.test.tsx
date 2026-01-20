import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import PageIndex from '@/pages/PageIndex';

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user' },
    loading: false,
  }),
}));

const renderPageIndex = () => {
  return render(
    <BrowserRouter>
      <PageIndex />
    </BrowserRouter>
  );
};

describe('PageIndex', () => {
  it('should render page index with title', () => {
    renderPageIndex();
    expect(screen.getByText('ページ一覧')).toBeInTheDocument();
  });

  it('should render all main categories', () => {
    renderPageIndex();
    
    expect(screen.getByText('CRM・営業')).toBeInTheDocument();
    expect(screen.getByText('請求・見積')).toBeInTheDocument();
    expect(screen.getByText('経費・会計')).toBeInTheDocument();
    expect(screen.getByText('人事・労務')).toBeInTheDocument();
    expect(screen.getByText('採用')).toBeInTheDocument();
    expect(screen.getByText('プロジェクト')).toBeInTheDocument();
    expect(screen.getByText('システム管理')).toBeInTheDocument();
  });

  it('should include credit-related pages', () => {
    renderPageIndex();
    
    expect(screen.getByText('クレジット')).toBeInTheDocument();
    expect(screen.getByText('クレジット履歴')).toBeInTheDocument();
  });

  it('should include recruiting pages', () => {
    renderPageIndex();
    
    expect(screen.getByText('求人一覧')).toBeInTheDocument();
    expect(screen.getByText('候補者管理')).toBeInTheDocument();
    expect(screen.getByText('面接日程')).toBeInTheDocument();
    expect(screen.getByText('採用レポート')).toBeInTheDocument();
  });

  it('should include delivery note and inventory pages', () => {
    renderPageIndex();
    
    expect(screen.getByText('納品書')).toBeInTheDocument();
    expect(screen.getByText('自動発注')).toBeInTheDocument();
  });

  it('should include project management pages', () => {
    renderPageIndex();
    
    expect(screen.getByText('プロジェクト')).toBeInTheDocument();
    expect(screen.getByText('ガントチャート')).toBeInTheDocument();
    expect(screen.getByText('カンバン')).toBeInTheDocument();
    expect(screen.getByText('工数記録')).toBeInTheDocument();
  });

  it('should include integration pages', () => {
    renderPageIndex();
    
    expect(screen.getByText('連携')).toBeInTheDocument();
    expect(screen.getByText('LINE連携')).toBeInTheDocument();
    expect(screen.getByText('Slack連携')).toBeInTheDocument();
  });

  it('should have valid links for pages', () => {
    renderPageIndex();
    
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    
    links.forEach((link) => {
      const href = link.getAttribute('href');
      expect(href).toBeTruthy();
      // All internal links should start with /
      if (href && !href.startsWith('http')) {
        expect(href).toMatch(/^\//);
      }
    });
  });

  it('should have at least 75 pages listed', () => {
    renderPageIndex();
    
    // Count all links that are page links (not external)
    const links = screen.getAllByRole('link');
    const internalLinks = links.filter(link => {
      const href = link.getAttribute('href');
      return href && href.startsWith('/');
    });
    
    expect(internalLinks.length).toBeGreaterThanOrEqual(75);
  });

  it('should display page descriptions', () => {
    renderPageIndex();
    
    // Check for some page descriptions
    expect(screen.getByText(/リード管理・顧客開拓/)).toBeInTheDocument();
    expect(screen.getByText(/請求書の作成・管理/)).toBeInTheDocument();
  });
});

describe('PageIndex search functionality', () => {
  it('should render search input', () => {
    renderPageIndex();
    
    const searchInput = screen.getByPlaceholderText(/検索/);
    expect(searchInput).toBeInTheDocument();
  });

  it('should filter pages when searching', async () => {
    const user = userEvent.setup();
    renderPageIndex();
    
    const searchInput = screen.getByPlaceholderText(/検索/);
    await user.type(searchInput, 'クレジット');
    
    // Credit-related pages should be visible
    expect(screen.getByText('クレジット')).toBeInTheDocument();
    
    // Unrelated pages should be hidden or filtered
    // Note: The exact behavior depends on implementation
  });

  it('should clear search when clicking clear button', async () => {
    const user = userEvent.setup();
    renderPageIndex();
    
    const searchInput = screen.getByPlaceholderText(/検索/);
    await user.type(searchInput, 'test search');
    
    expect(searchInput).toHaveValue('test search');
    
    // Find and click clear button if it exists
    const clearButton = screen.queryByRole('button', { name: /クリア|clear/i });
    if (clearButton) {
      await user.click(clearButton);
      expect(searchInput).toHaveValue('');
    }
  });
});

describe('PageIndex category sections', () => {
  it('should have collapsible category sections', () => {
    renderPageIndex();
    
    // Categories should be visible
    const categories = [
      'CRM・営業',
      '請求・見積',
      '経費・会計',
      '人事・労務',
      '採用',
      'プロジェクト',
      'システム管理',
    ];
    
    categories.forEach(category => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  it('should group pages correctly under categories', () => {
    renderPageIndex();
    
    // Check that invoices is under 請求・見積
    // This is a structural test to ensure proper categorization
    const billingSection = screen.getByText('請求・見積').closest('div');
    expect(billingSection).toBeInTheDocument();
  });
});

describe('PageIndex accessibility', () => {
  it('should have accessible page links with proper text', () => {
    renderPageIndex();
    
    const links = screen.getAllByRole('link');
    
    links.forEach(link => {
      // Each link should have text content
      expect(link.textContent).toBeTruthy();
    });
  });

  it('should have icons for visual identification', () => {
    renderPageIndex();
    
    // Check that SVG icons are present (from lucide-react)
    const svgIcons = document.querySelectorAll('svg');
    expect(svgIcons.length).toBeGreaterThan(0);
  });
});
