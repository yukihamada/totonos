import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import ServiceGuide from '@/pages/ServiceGuide';

describe('ServiceGuide Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<ServiceGuide />);
      await waitFor(() => {
        expect(screen.getByText('サービスガイド')).toBeInTheDocument();
      });
    });

    it('should render table of contents', async () => {
      render(<ServiceGuide />);
      await waitFor(() => {
        expect(screen.getByText('目次')).toBeInTheDocument();
        expect(screen.getByText('1. Totonosとは')).toBeInTheDocument();
        expect(screen.getByText('2. 機能詳細')).toBeInTheDocument();
      });
    });

    it('should render service categories', async () => {
      render(<ServiceGuide />);
      await waitFor(() => {
        expect(screen.getByText('CRM・営業管理')).toBeInTheDocument();
        expect(screen.getByText('請求・見積管理')).toBeInTheDocument();
        expect(screen.getByText('会計・経理')).toBeInTheDocument();
      });
    });

    it('should render use cases section', async () => {
      render(<ServiceGuide />);
      await waitFor(() => {
        expect(screen.getByText('3. ユースケース')).toBeInTheDocument();
        expect(screen.getByText('スタートアップの請求管理')).toBeInTheDocument();
      });
    });

    it('should render FAQ section', async () => {
      render(<ServiceGuide />);
      await waitFor(() => {
        expect(screen.getByText('6. よくある質問')).toBeInTheDocument();
        expect(screen.getByText('Totonosは無料で使えますか？')).toBeInTheDocument();
      });
    });

    it('should render navigation buttons', async () => {
      render(<ServiceGuide />);
      await waitFor(() => {
        expect(screen.getByText('ホームに戻る')).toBeInTheDocument();
        expect(screen.getByText('印刷')).toBeInTheDocument();
      });
    });
  });
});
