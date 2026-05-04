CREATE TABLE `signatures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`keyId` int NOT NULL,
	`messageType` varchar(50) NOT NULL,
	`messageName` varchar(255),
	`messageHash` varchar(64) NOT NULL,
	`signatureValue` longtext NOT NULL,
	`fileKey` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `signatures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sm2_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`keyName` varchar(255) NOT NULL,
	`publicKey` longtext NOT NULL,
	`privateKey` longtext NOT NULL,
	`algorithm` varchar(50) NOT NULL DEFAULT 'SM2',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sm2_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sm3_hashes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`inputType` varchar(50) NOT NULL,
	`inputName` varchar(255),
	`inputHash` varchar(64) NOT NULL,
	`outputHash` varchar(64) NOT NULL,
	`fileKey` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sm3_hashes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`messageType` varchar(50) NOT NULL,
	`messageName` varchar(255),
	`messageHash` varchar(64) NOT NULL,
	`signatureValue` longtext NOT NULL,
	`publicKey` longtext NOT NULL,
	`isValid` boolean NOT NULL,
	`fileKey` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `verifications_id` PRIMARY KEY(`id`)
);
