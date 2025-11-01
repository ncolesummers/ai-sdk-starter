import { describe, expect, it } from "vitest";
import {
	type ErrorCode,
	ChatSDKError,
	getMessageByErrorCode,
	visibilityBySurface,
} from "@/lib/errors";

describe("ChatSDKError", () => {
	describe("constructor", () => {
		it("should create an error with error code and optional cause", () => {
			const error = new ChatSDKError("bad_request:api");

			expect(error.type).toBe("bad_request");
			expect(error.surface).toBe("api");
			expect(error.statusCode).toBe(400);
			expect(error.message).toBe(
				"The request couldn't be processed. Please check your input and try again.",
			);
		});

		it("should set cause when provided", () => {
			const cause = "Database connection failed";
			const error = new ChatSDKError("bad_request:api", cause);

			expect(error.cause).toBe(cause);
		});

		it("should parse error type and surface from error code", () => {
			const error = new ChatSDKError("unauthorized:chat");

			expect(error.type).toBe("unauthorized");
			expect(error.surface).toBe("chat");
		});

		it("should set appropriate status code based on error type", () => {
			const badRequest = new ChatSDKError("bad_request:api");
			const unauthorized = new ChatSDKError("unauthorized:auth");
			const forbidden = new ChatSDKError("forbidden:chat");
			const notFound = new ChatSDKError("not_found:document");
			const rateLimit = new ChatSDKError("rate_limit:chat");
			const offline = new ChatSDKError("offline:chat");

			expect(badRequest.statusCode).toBe(400);
			expect(unauthorized.statusCode).toBe(401);
			expect(forbidden.statusCode).toBe(403);
			expect(notFound.statusCode).toBe(404);
			expect(rateLimit.statusCode).toBe(429);
			expect(offline.statusCode).toBe(503);
		});

		it("should extend Error class", () => {
			const error = new ChatSDKError("bad_request:api");

			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(ChatSDKError);
		});
	});

	describe("error codes", () => {
		it("should handle bad request codes", () => {
			const error = new ChatSDKError("bad_request:api");

			expect(error.type).toBe("bad_request");
			expect(error.surface).toBe("api");
		});

		it("should handle unauthorized codes", () => {
			const error = new ChatSDKError("unauthorized:chat");

			expect(error.type).toBe("unauthorized");
			expect(error.surface).toBe("chat");
		});

		it("should handle not found codes", () => {
			const error = new ChatSDKError("not_found:document");

			expect(error.type).toBe("not_found");
			expect(error.surface).toBe("document");
		});

		it("should handle forbidden codes", () => {
			const error = new ChatSDKError("forbidden:admin");

			expect(error.type).toBe("forbidden");
			expect(error.surface).toBe("admin");
		});
	});

	describe("getMessageByErrorCode", () => {
		it("should return appropriate message for bad_request:api", () => {
			const message = getMessageByErrorCode("bad_request:api");

			expect(message).toBe(
				"The request couldn't be processed. Please check your input and try again.",
			);
		});

		it("should return appropriate message for unauthorized:auth", () => {
			const message = getMessageByErrorCode("unauthorized:auth");

			expect(message).toBe("You need to sign in before continuing.");
		});

		it("should return appropriate message for rate_limit:chat", () => {
			const message = getMessageByErrorCode("rate_limit:chat");

			expect(message).toBe(
				"You have exceeded your maximum number of messages for the day. Please try again later.",
			);
		});

		it("should return appropriate message for database errors", () => {
			const message = getMessageByErrorCode("bad_request:database" as ErrorCode);

			expect(message).toBe(
				"An error occurred while executing a database query.",
			);
		});

		it("should return default message for unknown error codes", () => {
			const message = getMessageByErrorCode("unknown:error" as ErrorCode);

			expect(message).toBe("Something went wrong. Please try again later.");
		});
	});

	describe("visibilityBySurface", () => {
		it("should set database errors to log visibility", () => {
			expect(visibilityBySurface.database).toBe("log");
		});

		it("should set chat errors to response visibility", () => {
			expect(visibilityBySurface.chat).toBe("response");
		});

		it("should set auth errors to response visibility", () => {
			expect(visibilityBySurface.auth).toBe("response");
		});

		it("should set api errors to response visibility", () => {
			expect(visibilityBySurface.api).toBe("response");
		});
	});

	describe("toResponse", () => {
		it("should create appropriate Response for response visibility", () => {
			const error = new ChatSDKError("bad_request:api", "Invalid input");
			const response = error.toResponse();

			expect(response.status).toBe(400);
		});

		it("should mask error details for log visibility", () => {
			const error = new ChatSDKError("bad_request:database" as ErrorCode);
			const response = error.toResponse();

			expect(response.status).toBe(400);
		});
	});
});