-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_google_user" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otp_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "otp_code" TEXT,
ADD COLUMN     "otp_expires_at" TIMESTAMP(3);
