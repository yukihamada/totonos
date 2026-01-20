import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HpkiBridgeDownload } from "@/components/emr/HpkiBridgeDownload";

describe("HpkiBridgeDownload", () => {
  describe("card variant (default)", () => {
    it("should render card title", () => {
      render(<HpkiBridgeDownload />);
      expect(screen.getByText("HPKIブリッジアプリ")).toBeInTheDocument();
    });

    it("should render card description", () => {
      render(<HpkiBridgeDownload />);
      expect(
        screen.getByText(
          "HPKI電子署名機能を使用するには、ローカルブリッジアプリのインストールが必要です。"
        )
      ).toBeInTheDocument();
    });

    it("should render macOS download button", () => {
      render(<HpkiBridgeDownload />);
      expect(screen.getByText("macOS版")).toBeInTheDocument();
    });

    it("should render Windows download button", () => {
      render(<HpkiBridgeDownload />);
      expect(screen.getByText("Windows版")).toBeInTheDocument();
    });

    it("should render GitHub source link", () => {
      render(<HpkiBridgeDownload />);
      expect(screen.getByText("GitHubでソースコードを見る")).toBeInTheDocument();
    });

    it("should render usage notes", () => {
      render(<HpkiBridgeDownload />);
      expect(
        screen.getByText(/インストール後、アプリを起動してから/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/ICカードリーダーとHPKIカードが別途必要/)
      ).toBeInTheDocument();
    });

    it("should hide title when showTitle is false", () => {
      render(<HpkiBridgeDownload showTitle={false} />);
      expect(screen.queryByText("HPKIブリッジアプリ")).not.toBeInTheDocument();
    });

    it("should have correct macOS download link", () => {
      render(<HpkiBridgeDownload />);
      const macLink = screen.getByText("macOS版").closest("a");
      expect(macLink).toHaveAttribute(
        "href",
        expect.stringContaining("hpki-bridge-macos.dmg")
      );
    });

    it("should have correct Windows download link", () => {
      render(<HpkiBridgeDownload />);
      const windowsLink = screen.getByText("Windows版").closest("a");
      expect(windowsLink).toHaveAttribute(
        "href",
        expect.stringContaining("hpki-bridge-windows.exe")
      );
    });

    it("should have target blank on download links", () => {
      render(<HpkiBridgeDownload />);
      const macLink = screen.getByText("macOS版").closest("a");
      expect(macLink).toHaveAttribute("target", "_blank");
    });
  });

  describe("inline variant", () => {
    it("should render inline title", () => {
      render(<HpkiBridgeDownload variant="inline" />);
      expect(screen.getByText("HPKIブリッジアプリ")).toBeInTheDocument();
    });

    it("should render required badge", () => {
      render(<HpkiBridgeDownload variant="inline" />);
      expect(screen.getByText("HPKI署名に必要")).toBeInTheDocument();
    });

    it("should render inline description", () => {
      render(<HpkiBridgeDownload variant="inline" />);
      expect(
        screen.getByText(
          "電子署名機能を使用するには、ローカルブリッジアプリのインストールが必要です。"
        )
      ).toBeInTheDocument();
    });

    it("should render macOS button", () => {
      render(<HpkiBridgeDownload variant="inline" />);
      expect(screen.getByText("macOS版")).toBeInTheDocument();
    });

    it("should render Windows button", () => {
      render(<HpkiBridgeDownload variant="inline" />);
      expect(screen.getByText("Windows版")).toBeInTheDocument();
    });

    it("should render source code link", () => {
      render(<HpkiBridgeDownload variant="inline" />);
      expect(screen.getByText("ソースコード")).toBeInTheDocument();
    });
  });

  describe("compact variant", () => {
    it("should render Mac button", () => {
      render(<HpkiBridgeDownload variant="compact" />);
      expect(screen.getByText("Mac")).toBeInTheDocument();
    });

    it("should render Windows button", () => {
      render(<HpkiBridgeDownload variant="compact" />);
      expect(screen.getByText("Windows")).toBeInTheDocument();
    });

    it("should not render title in compact variant", () => {
      render(<HpkiBridgeDownload variant="compact" />);
      expect(screen.queryByText("HPKIブリッジアプリ")).not.toBeInTheDocument();
    });

    it("should have correct download links in compact variant", () => {
      render(<HpkiBridgeDownload variant="compact" />);
      const macLink = screen.getByText("Mac").closest("a");
      const windowsLink = screen.getByText("Windows").closest("a");
      expect(macLink).toHaveAttribute("href", expect.stringContaining("macos"));
      expect(windowsLink).toHaveAttribute("href", expect.stringContaining("windows"));
    });
  });
});
