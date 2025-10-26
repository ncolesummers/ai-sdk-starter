ALTER TABLE "Account" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Account" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Session" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Session" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Verification" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Verification" ALTER COLUMN "id" DROP DEFAULT;