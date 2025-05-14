-- AlterTable
ALTER TABLE `Claim` ADD COLUMN `transportToTeachingDistanceKM` DOUBLE NULL,
    ADD COLUMN `transportToTeachingFrom` VARCHAR(191) NULL,
    ADD COLUMN `transportToTeachingInDate` DATETIME(3) NULL,
    ADD COLUMN `transportToTeachingOutDate` DATETIME(3) NULL,
    ADD COLUMN `transportToTeachingReturnFrom` VARCHAR(191) NULL,
    ADD COLUMN `transportToTeachingReturnTo` VARCHAR(191) NULL,
    ADD COLUMN `transportToTeachingTo` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `SignupRequest` MODIFY `requestedRole` ENUM('REGISTRY', 'COORDINATOR', 'LECTURER', 'STAFF_REGISTRY') NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `designation` ENUM('ASSISTANT_LECTURER', 'LECTURER', 'SENIOR_LECTURER', 'PROFESSOR') NULL,
    MODIFY `role` ENUM('REGISTRY', 'COORDINATOR', 'LECTURER', 'STAFF_REGISTRY') NOT NULL;

-- CreateTable
CREATE TABLE `StaffRegistryCenterAssignment` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `centerId` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `StaffRegistryCenterAssignment_userId_idx`(`userId`),
    INDEX `StaffRegistryCenterAssignment_centerId_idx`(`centerId`),
    UNIQUE INDEX `StaffRegistryCenterAssignment_userId_centerId_key`(`userId`, `centerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StaffRegistryCenterAssignment` ADD CONSTRAINT `StaffRegistryCenterAssignment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StaffRegistryCenterAssignment` ADD CONSTRAINT `StaffRegistryCenterAssignment_centerId_fkey` FOREIGN KEY (`centerId`) REFERENCES `Center`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
