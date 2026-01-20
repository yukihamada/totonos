import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import ServiceAgreement from '@/pages/ServiceAgreement';

describe('ServiceAgreement Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<ServiceAgreement />);
      await waitFor(() => {
        expect(screen.getByText('利用契約書・SLA')).toBeInTheDocument();
      });
    });

    it('should render service content section', async () => {
      render(<ServiceAgreement />);
      await waitFor(() => {
        expect(screen.getByText('第1条（サービス内容）')).toBeInTheDocument();
        expect(screen.getByText('1. 提供機能')).toBeInTheDocument();
      });
    });

    it('should render SLA section', async () => {
      render(<ServiceAgreement />);
      await waitFor(() => {
        expect(screen.getByText('第2条（サービスレベル保証・SLA）')).toBeInTheDocument();
        expect(screen.getByText('1. 稼働率保証')).toBeInTheDocument();
      });
    });

    it('should render SLA table with plan info', async () => {
      render(<ServiceAgreement />);
      await waitFor(() => {
        expect(screen.getByText('Free / Starter')).toBeInTheDocument();
        expect(screen.getByText('Standard')).toBeInTheDocument();
        expect(screen.getByText('99.5%')).toBeInTheDocument();
      });
    });

    it('should render data handling section', async () => {
      render(<ServiceAgreement />);
      await waitFor(() => {
        expect(screen.getByText('第3条（データの取扱い）')).toBeInTheDocument();
        expect(screen.getByText('1. データの所有権')).toBeInTheDocument();
      });
    });

    it('should render security section', async () => {
      render(<ServiceAgreement />);
      await waitFor(() => {
        expect(screen.getByText('第4条（セキュリティ）')).toBeInTheDocument();
      });
    });

    it('should render navigation buttons', async () => {
      render(<ServiceAgreement />);
      await waitFor(() => {
        expect(screen.getByText('ホームに戻る')).toBeInTheDocument();
        expect(screen.getByText('印刷')).toBeInTheDocument();
      });
    });
  });
});
