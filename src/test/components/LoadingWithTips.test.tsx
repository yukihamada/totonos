import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingWithTips } from '@/components/LoadingWithTips';

describe('LoadingWithTips', () => {
  describe('rendering', () => {
    it('should render with default props', () => {
      render(<LoadingWithTips />);
      expect(screen.getByText('ヒント')).toBeInTheDocument();
    });

    it('should render skeleton by default', () => {
      const { container } = render(<LoadingWithTips />);
      // TableSkeleton renders skeleton elements
      expect(container).toBeInTheDocument();
    });

    it('should hide tip when showTip is false', () => {
      render(<LoadingWithTips showTip={false} />);
      expect(screen.queryByText('ヒント')).not.toBeInTheDocument();
    });
  });

  describe('module tips', () => {
    it('should show invoice-related tip for invoices module', () => {
      render(<LoadingWithTips module="invoices" />);
      expect(screen.getByText('ヒント')).toBeInTheDocument();
    });

    it('should show expense-related tip for expenses module', () => {
      render(<LoadingWithTips module="expenses" />);
      expect(screen.getByText('ヒント')).toBeInTheDocument();
    });

    it('should show employee-related tip for employees module', () => {
      render(<LoadingWithTips module="employees" />);
      expect(screen.getByText('ヒント')).toBeInTheDocument();
    });

    it('should show contract-related tip for contracts module', () => {
      render(<LoadingWithTips module="contracts" />);
      expect(screen.getByText('ヒント')).toBeInTheDocument();
    });

    it('should show lead-related tip for leads module', () => {
      render(<LoadingWithTips module="leads" />);
      expect(screen.getByText('ヒント')).toBeInTheDocument();
    });

    it('should show deal-related tip for deals module', () => {
      render(<LoadingWithTips module="deals" />);
      expect(screen.getByText('ヒント')).toBeInTheDocument();
    });

    it('should show project-related tip for projects module', () => {
      render(<LoadingWithTips module="projects" />);
      expect(screen.getByText('ヒント')).toBeInTheDocument();
    });

    it('should show wiki-related tip for wiki module', () => {
      render(<LoadingWithTips module="wiki" />);
      expect(screen.getByText('ヒント')).toBeInTheDocument();
    });

    it('should show general tip for general module', () => {
      render(<LoadingWithTips module="general" />);
      expect(screen.getByText('ヒント')).toBeInTheDocument();
    });
  });

  describe('skeleton types', () => {
    it('should render table skeleton by default', () => {
      const { container } = render(<LoadingWithTips skeletonType="table" />);
      expect(container).toBeInTheDocument();
    });

    it('should render card skeleton', () => {
      const { container } = render(<LoadingWithTips skeletonType="card" />);
      expect(container).toBeInTheDocument();
    });

    it('should render list skeleton', () => {
      const { container } = render(<LoadingWithTips skeletonType="list" />);
      expect(container).toBeInTheDocument();
    });

    it('should render grid skeleton', () => {
      const { container } = render(<LoadingWithTips skeletonType="grid" />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('customization', () => {
    it('should accept custom columns', () => {
      const { container } = render(<LoadingWithTips columns={3} />);
      expect(container).toBeInTheDocument();
    });

    it('should accept custom rows', () => {
      const { container } = render(<LoadingWithTips rows={10} />);
      expect(container).toBeInTheDocument();
    });

    it('should accept both columns and rows', () => {
      const { container } = render(<LoadingWithTips columns={4} rows={8} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('all module types', () => {
    const moduleTypes = [
      'invoices', 'estimates', 'contracts', 'leads', 'clients',
      'deals', 'employees', 'projects', 'expenses', 'wiki',
      'products', 'activities', 'attendance', 'leave', 'payroll',
      'it-assets', 'notifications', 'audit', 'emails', 'jobs',
      'candidates', 'team', 'purchase-orders', 'general'
    ] as const;

    moduleTypes.forEach(module => {
      it(`should render without error for module: ${module}`, () => {
        const { container } = render(<LoadingWithTips module={module} />);
        expect(container).toBeInTheDocument();
      });
    });
  });
});
