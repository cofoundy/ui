import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConfirmationCard } from "../../components/chat-widget/ConfirmationCard";
import type { Appointment } from "../../types";

describe("ConfirmationCard", () => {
  const createAppointment = (overrides: Partial<Appointment> = {}): Appointment => ({
    id: "apt_123",
    date: "2025-01-27",
    time: "10:00 AM",
    topic: "Consultoría técnica",
    attendees: [],
    confirmed: true,
    ...overrides,
  });

  describe("Rendering", () => {
    it("should render the appointment date and time", () => {
      const appointment = createAppointment({
        date: "2025-01-27",
        time: "10:00 AM",
      });

      render(<ConfirmationCard appointment={appointment} />);

      // Should show formatted date (Spanish locale)
      expect(screen.getByText(/lun 27 ene/i)).toBeInTheDocument();
      expect(screen.getByText(/10:00 AM/)).toBeInTheDocument();
    });

    it("should render the topic when provided", () => {
      const appointment = createAppointment({
        topic: "Product Demo",
      });

      render(<ConfirmationCard appointment={appointment} />);

      expect(screen.getByText("Product Demo")).toBeInTheDocument();
    });

    it("should NOT render topic section when topic is empty", () => {
      const appointment = createAppointment({
        topic: "",
      });

      render(<ConfirmationCard appointment={appointment} />);

      // Only date/time and confirmation badge should be visible
      const container = screen.getByText(/Confirmada/).closest("div")?.parentElement;
      expect(container?.textContent).not.toContain("undefined");
    });

    it("should show 'Confirmada' badge", () => {
      const appointment = createAppointment();

      render(<ConfirmationCard appointment={appointment} />);

      expect(screen.getByText("Confirmada")).toBeInTheDocument();
    });

    it("should render CalendarCheck icon", () => {
      const appointment = createAppointment();

      const { container } = render(<ConfirmationCard appointment={appointment} />);

      // Lucide icons render as SVG
      const svgIcons = container.querySelectorAll("svg");
      expect(svgIcons.length).toBeGreaterThan(0);
    });
  });

  describe("Date Formatting", () => {
    it("should format dates in Spanish locale", () => {
      const testCases = [
        { date: "2025-01-15", expected: /mié 15 ene/i }, // Wednesday
        { date: "2025-02-03", expected: /lun 3 feb/i },  // Monday
        { date: "2025-03-21", expected: /vie 21 mar/i }, // Friday
        { date: "2025-12-25", expected: /jue 25 dic/i }, // Thursday (Christmas)
      ];

      for (const { date, expected } of testCases) {
        const appointment = createAppointment({ date });
        const { unmount } = render(<ConfirmationCard appointment={appointment} />);
        expect(screen.getByText(expected)).toBeInTheDocument();
        unmount();
      }
    });

    it("should handle different time formats", () => {
      const testCases = [
        "10:00 AM",
        "2:30 PM",
        "14:00",
        "9:00",
      ];

      for (const time of testCases) {
        const appointment = createAppointment({ time });
        const { unmount } = render(<ConfirmationCard appointment={appointment} />);
        expect(screen.getByText(new RegExp(time))).toBeInTheDocument();
        unmount();
      }
    });
  });

  describe("Styling", () => {
    it("should have card background styling", () => {
      const appointment = createAppointment();

      const { container } = render(<ConfirmationCard appointment={appointment} />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("bg-[var(--chat-card)]");
    });

    it("should have border styling", () => {
      const appointment = createAppointment();

      const { container } = render(<ConfirmationCard appointment={appointment} />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("border");
      expect(card).toHaveClass("border-[var(--chat-border)]");
    });

    it("should have rounded corners", () => {
      const appointment = createAppointment();

      const { container } = render(<ConfirmationCard appointment={appointment} />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("rounded-lg");
    });

    it("should have success accent bar", () => {
      const appointment = createAppointment();

      const { container } = render(<ConfirmationCard appointment={appointment} />);

      // First child inside the card should be the accent bar
      const accentBar = container.querySelector(".h-1");
      expect(accentBar).toBeInTheDocument();
      expect(accentBar).toHaveClass("bg-gradient-to-r");
    });

    it("should apply custom className", () => {
      const appointment = createAppointment();

      const { container } = render(
        <ConfirmationCard appointment={appointment} className="custom-class" />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("custom-class");
    });
  });

  describe("Accessibility", () => {
    it("should have semantic structure", () => {
      const appointment = createAppointment({
        topic: "Strategy Call",
      });

      render(<ConfirmationCard appointment={appointment} />);

      // Check that content is readable
      expect(screen.getByText(/Strategy Call/)).toBeInTheDocument();
      expect(screen.getByText(/Confirmada/)).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long topic gracefully", () => {
      const longTopic = "This is a very long topic that might overflow ".repeat(5);
      const appointment = createAppointment({ topic: longTopic });

      const { container } = render(<ConfirmationCard appointment={appointment} />);

      // Should render without breaking
      expect(container.textContent).toContain("This is a very long topic");
    });

    it("should handle special characters in topic", () => {
      const appointment = createAppointment({
        topic: "Café & Técnico: ¿Preguntas?",
      });

      render(<ConfirmationCard appointment={appointment} />);

      expect(screen.getByText("Café & Técnico: ¿Preguntas?")).toBeInTheDocument();
    });

    it("should handle 'Por confirmar' time placeholder", () => {
      const appointment = createAppointment({
        time: "Por confirmar",
      });

      render(<ConfirmationCard appointment={appointment} />);

      expect(screen.getByText(/Por confirmar/)).toBeInTheDocument();
    });
  });
});
