import { act, cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LAB_CONTENT_BY_LOCALE } from "@/content/lab";

import { FundamentalsLab } from "./fundamentals-lab";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("FundamentalsLab", () => {
  it.each([
    ["English", LAB_CONTENT_BY_LOCALE.en],
    ["French", LAB_CONTENT_BY_LOCALE.fr],
  ])("renders the %s locale with equivalent semantic structure", (_, content) => {
    const { container } = render(<FundamentalsLab content={content} />);

    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("lang", content.locale);
    expect(
      screen.getByRole("heading", { level: 1, name: content.title }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(
      content.modules.length + 1,
    );
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(
      content.modules.length * 9,
    );
    expect(
      screen.getByRole("navigation", { name: content.labels.moduleNavigation }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", {
        name: content.labels.languageNavigation,
      }),
    ).toBeInTheDocument();
    expect(container.querySelector("#lab-00")).toBeInTheDocument();
    expect(container.querySelector("#step-00-01")).toBeInTheDocument();
    expect(container.querySelector("#check-00")).toBeInTheDocument();
  });

  it("keeps the language switch on the aligned module anchor in root mode", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");
    render(<FundamentalsLab content={LAB_CONTENT_BY_LOCALE.en} />);

    expect(screen.getByRole("link", { name: "Français" })).toHaveAttribute(
      "href",
      "/lab/fr#lab-00",
    );

    act(() => {
      window.location.hash = "lab-05";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });

    expect(screen.getByRole("link", { name: "Français" })).toHaveAttribute(
      "href",
      "/lab/fr#lab-05",
    );
  });

  it("renders exact commands, safety guidance, and keyboard-focusable code", () => {
    const { container } = render(
      <FundamentalsLab content={LAB_CONTENT_BY_LOCALE.en} />,
    );

    expect(
      screen.getByText("npm run test -- lab-content fundamentals-lab"),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(LAB_CONTENT_BY_LOCALE.en.labels.prompt).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("heading", {
        name: LAB_CONTENT_BY_LOCALE.en.labels.recovery,
      }),
    ).toHaveLength(LAB_CONTENT_BY_LOCALE.en.modules.length);
    expect(screen.getByText(/Use only fictitious information/)).toBeInTheDocument();
    expect(container.querySelector("pre[tabindex='0']")).toBeInTheDocument();

    const checkpoint = container.querySelector(".lab-checkpoint");
    expect(checkpoint).not.toBeNull();
    expect(within(checkpoint as HTMLElement).getByRole("list")).toBeInTheDocument();
  });
});