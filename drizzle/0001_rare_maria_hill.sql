CREATE TABLE `auth_flows` (
	`id_hash` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`verifier` text NOT NULL,
	`nonce` text NOT NULL,
	`return_to` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `auth_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`expires_at` integer NOT NULL
);
