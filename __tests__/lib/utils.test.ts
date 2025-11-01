import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("utils", () => {
	describe("cn", () => {
		it("should merge class names correctly", () => {
			const result = cn("text-red-500", "bg-blue-500");
			expect(result).toBe("text-red-500 bg-blue-500");
		});

		it("should handle conditional classes", () => {
			const result = cn("base-class", {
				"conditional-class": true,
				"not-included": false,
			});
			expect(result).toContain("base-class");
			expect(result).toContain("conditional-class");
			expect(result).not.toContain("not-included");
		});

		it("should override conflicting Tailwind classes", () => {
			const result = cn("text-red-500", "text-blue-500");
			expect(result).toBe("text-blue-500");
		});

		it("should handle undefined and null values", () => {
			const result = cn("base", undefined, null, "other");
			expect(result).toBe("base other");
		});

		it("should handle arrays of classes", () => {
			const result = cn(["class1", "class2"], "class3");
			expect(result).toBe("class1 class2 class3");
		});
	});
});