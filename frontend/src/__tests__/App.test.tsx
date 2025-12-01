import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";
import * as api from "../api";
import { vi } from "vitest";

vi.mock("../api");

describe("App", () => {
  it("renders and shortens", async () => {
    (api.shorten as any).mockResolvedValue({
      short: "/r/abc123",
      code: "abc123",
    });
    (api.listLinks as any).mockResolvedValue([]);

    render(<App />);

    const input = screen.getByPlaceholderText(/Paste a URL/i);
    const button = screen.getByRole("button", { name: /shorten/i });

    fireEvent.change(input, { target: { value: "https://example.com" } });
    fireEvent.click(button);

    const short = await screen.findByText(/Short URL/i);
    expect(short).toBeInTheDocument();
  });
});
