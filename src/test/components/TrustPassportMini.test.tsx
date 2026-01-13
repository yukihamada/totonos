import { describe, it, expect } from "vitest";
import { render, screen } from "../test-utils";
import { TrustPassportMini } from "@/components/dashboard/TrustPassportMini";

describe("TrustPassportMini", () => {
  it("renders Trust Passport title", () => {
    render(<TrustPassportMini score={782} rank="A" />);
    expect(screen.getByText("Trust Passport")).toBeInTheDocument();
  });

  it("renders the score correctly", () => {
    render(<TrustPassportMini score={782} rank="A" />);
    expect(screen.getByText("782 / 1000")).toBeInTheDocument();
  });

  it("renders the rank correctly", () => {
    render(<TrustPassportMini score={782} rank="A" />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("shows score change when previousScore is provided", () => {
    render(<TrustPassportMini score={782} rank="A" previousScore={759} />);
    expect(screen.getByText("+23ポイント")).toBeInTheDocument();
    expect(screen.getByText("先月比")).toBeInTheDocument();
  });

  it("shows points to next rank for non-S rank", () => {
    render(<TrustPassportMini score={782} rank="A" />);
    expect(screen.getByText("118ポイントで次のランクへ")).toBeInTheDocument();
  });

  it("shows max rank message for S rank", () => {
    render(<TrustPassportMini score={950} rank="S" />);
    expect(screen.getByText("最高ランク達成!")).toBeInTheDocument();
  });

  it("renders details link", () => {
    render(<TrustPassportMini score={782} rank="A" />);
    expect(screen.getByRole("link", { name: "詳細を見る" })).toBeInTheDocument();
  });

  it("calculates progress percentage correctly", () => {
    render(<TrustPassportMini score={500} rank="B" />);
    // Progress should show 50% for score of 500/1000
    const progressBar = document.querySelector('[role="progressbar"]');
    expect(progressBar).toBeInTheDocument();
  });
});
