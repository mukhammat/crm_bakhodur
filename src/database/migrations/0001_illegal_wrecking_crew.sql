CREATE TABLE "managers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "managers_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "workers" ADD COLUMN "name" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "managers" ADD CONSTRAINT "managers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workers" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "workers" DROP COLUMN "last_name";