CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`reference` text NOT NULL,
	`customer_name` text NOT NULL,
	`email` text NOT NULL,
	`address` text NOT NULL,
	`items` text NOT NULL,
	`total` integer NOT NULL,
	`status` text DEFAULT 'payment_preview' NOT NULL,
	`payment_status` text DEFAULT 'not_charged' NOT NULL,
	`request_key` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_reference_unique` ON `orders` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_request_key_unique` ON `orders` (`request_key`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`price` integer NOT NULL,
	`image` text NOT NULL,
	`gallery` text DEFAULT '[]' NOT NULL,
	`colour` text NOT NULL,
	`sizes` text DEFAULT '["S","M","L","XL","XXL"]' NOT NULL,
	`stock` integer DEFAULT 30 NOT NULL,
	`tag` text DEFAULT '' NOT NULL,
	`published` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wishlists` (
	`user_id` text PRIMARY KEY NOT NULL,
	`product_ids` text DEFAULT '[]' NOT NULL
);
