import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VisitTypeIndicator, getVisitTypeLabel } from "@/components/emr/VisitTypeIndicator";

describe("VisitTypeIndicator", () => {
  describe("rendering", () => {
    it("should render first_visit badge with correct label", () => {
      render(<VisitTypeIndicator visitType="first_visit" />);
      expect(screen.getByText("新患")).toBeInTheDocument();
    });

    it("should render return_visit badge with correct label", () => {
      render(<VisitTypeIndicator visitType="return_visit" />);
      expect(screen.getByText("再診")).toBeInTheDocument();
    });

    it("should render with small size class when size is sm", () => {
      const { container } = render(<VisitTypeIndicator visitType="first_visit" size="sm" />);
      const badge = container.querySelector("div");
      expect(badge).toHaveClass("text-[10px]");
    });

    it("should render with medium size class by default", () => {
      const { container } = render(<VisitTypeIndicator visitType="first_visit" />);
      const badge = container.querySelector("div");
      expect(badge).toHaveClass("text-xs");
    });

    it("should apply blue background for first_visit", () => {
      const { container } = render(<VisitTypeIndicator visitType="first_visit" />);
      const badge = container.querySelector("div");
      expect(badge).toHaveClass("bg-blue-500");
    });

    it("should apply green background for return_visit", () => {
      const { container } = render(<VisitTypeIndicator visitType="return_visit" />);
      const badge = container.querySelector("div");
      expect(badge).toHaveClass("bg-green-500");
    });
  });

  describe("getVisitTypeLabel", () => {
    it("should return correct label for first_visit", () => {
      expect(getVisitTypeLabel("first_visit")).toBe("新患");
    });

    it("should return correct label for return_visit", () => {
      expect(getVisitTypeLabel("return_visit")).toBe("再診");
    });
  });
});
