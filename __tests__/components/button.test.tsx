import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
	it("should render with text content", () => {
		render(<Button>Click me</Button>);
		expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
	});

	it("should handle click events", async () => {
		const user = userEvent.setup();
		const handleClick = vi.fn();

		render(<Button onClick={handleClick}>Click me</Button>);

		const button = screen.getByRole("button", { name: /click me/i });
		await user.click(button);

		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("should be disabled when disabled prop is true", () => {
		render(<Button disabled>Disabled</Button>);
		const button = screen.getByRole("button", { name: /disabled/i });
		expect(button).toBeDisabled();
	});

	it("should apply variant classes correctly", () => {
		const { container } = render(<Button variant="destructive">Delete</Button>);
		const button = container.querySelector("button");
		expect(button).toHaveClass("bg-destructive");
	});

	it("should apply size classes correctly", () => {
		const { container } = render(<Button size="sm">Small</Button>);
		const button = container.querySelector("button");
		expect(button).toHaveClass("h-9");
	});

	it("should render as a child component when asChild is true", () => {
		render(
			<Button asChild>
				<a href="/test">Link Button</a>
			</Button>
		);

		const link = screen.getByRole("link", { name: /link button/i });
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute("href", "/test");
	});
});