-- CreateTable
CREATE TABLE `Center` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `coordinatorId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Center_name_key`(`name`),
    UNIQUE INDEX `Center_coordinatorId_key`(`coordinatorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Claim` (
    `id` VARCHAR(191) NOT NULL,
    `claimType` ENUM('TEACHING', 'TRANSPORTATION', 'THESIS_PROJECT') NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `processedAt` DATETIME(3) NULL,
    `submittedById` VARCHAR(191) NOT NULL,
    `centerId` VARCHAR(191) NOT NULL,
    `processedById` VARCHAR(191) NULL,
    `teachingDate` DATETIME(3) NULL,
    `teachingStartTime` VARCHAR(191) NULL,
    `teachingEndTime` VARCHAR(191) NULL,
    `teachingHours` DOUBLE NULL,
    `transportType` ENUM('PUBLIC', 'PRIVATE') NULL,
    `transportDestinationTo` VARCHAR(191) NULL,
    `transportDestinationFrom` VARCHAR(191) NULL,
    `transportRegNumber` VARCHAR(191) NULL,
    `transportCubicCapacity` INTEGER NULL,
    `transportAmount` DOUBLE NULL,
    `thesisType` ENUM('SUPERVISION', 'EXAMINATION') NULL,
    `thesisSupervisionRank` ENUM('PHD', 'MPHIL', 'MA', 'MSC', 'BED', 'BSC', 'BA', 'ED') NULL,
    `thesisExamCourseCode` VARCHAR(191) NULL,
    `thesisExamDate` DATETIME(3) NULL,

    INDEX `Claim_centerId_idx`(`centerId`),
    INDEX `Claim_claimType_idx`(`claimType`),
    INDEX `Claim_processedById_idx`(`processedById`),
    INDEX `Claim_status_idx`(`status`),
    INDEX `Claim_submittedById_idx`(`submittedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `centerId` VARCHAR(191) NOT NULL,

    INDEX `Department_centerId_idx`(`centerId`),
    UNIQUE INDEX `Department_name_centerId_key`(`name`, `centerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupervisedStudent` (
    `id` VARCHAR(191) NOT NULL,
    `studentName` VARCHAR(191) NOT NULL,
    `thesisTitle` VARCHAR(191) NOT NULL,
    `claimId` VARCHAR(191) NOT NULL,
    `supervisorId` VARCHAR(191) NOT NULL,

    INDEX `SupervisedStudent_claimId_idx`(`claimId`),
    INDEX `SupervisedStudent_supervisorId_idx`(`supervisorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('REGISTRY', 'COORDINATOR', 'LECTURER') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lecturerCenterId` VARCHAR(191) NULL,
    `departmentId` VARCHAR(191) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_departmentId_idx`(`departmentId`),
    INDEX `User_lecturerCenterId_idx`(`lecturerCenterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Center` ADD CONSTRAINT `Center_coordinatorId_fkey` FOREIGN KEY (`coordinatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Claim` ADD CONSTRAINT `Claim_centerId_fkey` FOREIGN KEY (`centerId`) REFERENCES `Center`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Claim` ADD CONSTRAINT `Claim_processedById_fkey` FOREIGN KEY (`processedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Claim` ADD CONSTRAINT `Claim_submittedById_fkey` FOREIGN KEY (`submittedById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_centerId_fkey` FOREIGN KEY (`centerId`) REFERENCES `Center`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupervisedStudent` ADD CONSTRAINT `SupervisedStudent_claimId_fkey` FOREIGN KEY (`claimId`) REFERENCES `Claim`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupervisedStudent` ADD CONSTRAINT `SupervisedStudent_supervisorId_fkey` FOREIGN KEY (`supervisorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_lecturerCenterId_fkey` FOREIGN KEY (`lecturerCenterId`) REFERENCES `Center`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
