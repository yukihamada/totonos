import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    
    expect(screen.getByText('メイン')).toBeInTheDocument();
    expect(screen.getByText('営業・CRM')).toBeInTheDocument();
    expect(screen.getByText('会計')).toBeInTheDocument();
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
    expect(screen.getByText('面接スケジュール')).toBeInTheDocument();
    expect(screen.getByText('採用レポート')).toBeInTheDocument();
  });

  it('should include project management pages', () => {
    renderPageIndex();
    
    expect(screen.getByText('プロジェクト')).toBeInTheDocument();
    expect(screen.getByText('ガントチャート')).toBeInTheDocument();
    expect(screen.getByText('カンバン')).toBeInTheDocument();
    expect(screen.getByText('工数記録')).toBeInTheDocument();
  });

  it('should have valid links for pages', () => {
    renderPageIndex();
    
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    
    links.forEach((link) => {
      const href = link.getAttribute('href');
      expect(href).toBeTruthy();
      if (href && !href.startsWith('http')) {
        expect(href).toMatch(/^\//);
      }
    });
  });

  it('should have summary cards', () => {
    renderPageIndex();
    
    expect(screen.getByText('総ページ数')).toBeInTheDocument();
    expect(screen.getByText('カテゴリ数')).toBeInTheDocument();
  });
});

describe('PageIndex accessibility', () => {
  it('should have accessible page links with proper text', () => {
    renderPageIndex();
    
    const links = screen.getAllByRole('link');
    
    links.forEach(link => {
      expect(link.textContent).toBeTruthy();
    });
  });

  it('should have icons for visual identification', () => {
    renderPageIndex();
    
    const svgIcons = document.querySelectorAll('svg');
    expect(svgIcons.length).toBeGreaterThan(0);
  });
});
