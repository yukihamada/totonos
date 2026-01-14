import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Landing from "@/pages/Landing";

describe("Landing Page", () => {
  it("renders the hero section with title", () => {
    render(<Landing />);
    expect(screen.getByText("10個のSaaSを")).toBeInTheDocument();
    expect(screen.getByText("1つに統合")).toBeInTheDocument();
  });

  it("renders the Totonos logo", () => {
    render(<Landing />);
    // There are multiple "Totonos" texts, so use getAllByText
    const totonosElements = screen.getAllByText("Totonos");
    expect(totonosElements.length).toBeGreaterThan(0);
  });

  it("renders login and signup buttons", () => {
    render(<Landing />);
    expect(screen.getByText("ログイン")).toBeInTheDocument();
    expect(screen.getAllByText("無料で始める")).toHaveLength(2);
  });

  it("renders all 10 feature cards", () => {
    render(<Landing />);
    expect(screen.getByText("Smart Invoice")).toBeInTheDocument();
    expect(screen.getByText("Auto-Reconciliation")).toBeInTheDocument();
    expect(screen.getByText("Dynamic Boost")).toBeInTheDocument();
    expect(screen.getByText("Trust Passport")).toBeInTheDocument();
    expect(screen.getByText("Full Accounting")).toBeInTheDocument();
    expect(screen.getByText("Smart Contract")).toBeInTheDocument();
    expect(screen.getByText("HR Suite")).toBeInTheDocument();
    expect(screen.getByText("CRM & Sales")).toBeInTheDocument();
    expect(screen.getByText("Company Wiki")).toBeInTheDocument();
    expect(screen.getByText("IT Asset Management")).toBeInTheDocument();
  });

  it("renders all benefit items", () => {
    render(<Landing />);
    expect(screen.getByText("請求書作成時間を90%削減")).toBeInTheDocument();
    expect(screen.getByText("入金消込の完全自動化")).toBeInTheDocument();
    expect(screen.getByText("最短即日での資金調達")).toBeInTheDocument();
  });

  it("renders comparison tabs", () => {
    render(<Landing />);
    expect(screen.getByText("請求・経理")).toBeInTheDocument();
    expect(screen.getByText("資金調達")).toBeInTheDocument();
    expect(screen.getByText("会計")).toBeInTheDocument();
    expect(screen.getByText("人事・労務")).toBeInTheDocument();
    expect(screen.getByText("CRM・営業")).toBeInTheDocument();
    expect(screen.getByText("法務・契約")).toBeInTheDocument();
    expect(screen.getByText("情報管理")).toBeInTheDocument();
  });

  it("renders price comparison section", () => {
    render(<Landing />);
    expect(screen.getByText("月額 10万円以上")).toBeInTheDocument();
    const zeroYenElements = screen.getAllByText("0円");
    expect(zeroYenElements.length).toBeGreaterThan(0);
  });

  it("renders the footer", () => {
    render(<Landing />);
    expect(screen.getByText("© 2026 Totonos. All rights reserved.")).toBeInTheDocument();
  });

  it("renders CTA section", () => {
    render(<Landing />);
    expect(screen.getByText("今すぐ無料で始めましょう")).toBeInTheDocument();
    expect(screen.getByText("無料アカウントを作成")).toBeInTheDocument();
  });
});
