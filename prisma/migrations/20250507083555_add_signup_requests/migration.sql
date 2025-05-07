/*
  Warnings:

  - A unique constraint covering the columns `[approvedSignupRequestId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `approvedSignupRequestId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `SignupRequest` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `hashedPassword` VARCHAR(191) NOT NULL,
    `requestedRole` ENUM('REGISTRY', 'COORDINATOR', 'LECTURER') NOT NULL,
    `requestedCenterId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processedAt` DATETIME(3) NULL,
    `processedByRegistryId` VARCHAR(191) NULL,

    UNIQUE INDEX `SignupRequest_email_key`(`email`),
    INDEX `SignupRequest_status_idx`(`status`),
    INDEX `SignupRequest_processedByRegistryId_idx`(`processedByRegistryId`),
    INDEX `SignupRequest_requestedCenterId_idx`(`requestedCenterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_approvedSignupRequestId_key` ON `User`(`approvedSignupRequestId`);

-- CreateIndex
CREATE INDEX `User_approvedSignupRequestId_idx` ON `User`(`approvedSignupRequestId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_approvedSignupRequestId_fkey` FOREIGN KEY (`approvedSignupRequestId`) REFERENCES `SignupRequest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SignupRequest` ADD CONSTRAINT `SignupRequest_processedByRegistryId_fkey` FOREIGN KEY (`processedByRegistryId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
