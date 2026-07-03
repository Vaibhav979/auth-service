/*
  Warnings:

  - Made the column `hashedToken` on table `RefreshToken` required. This step will fail if there are existing NULL values in that column.
  - Made the column `jti` on table `RefreshToken` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "hashedToken" SET NOT NULL,
ALTER COLUMN "jti" SET NOT NULL;
