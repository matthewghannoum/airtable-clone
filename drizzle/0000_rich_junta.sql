CREATE TABLE "airtable-clone_account" (
	"userId" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "airtable-clone_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "airtable-clone_at_column" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" text NOT NULL,
	"airtableId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "airtable-clone_at_row" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"insertionOrder" integer NOT NULL,
	"values" jsonb NOT NULL,
	"createdTimestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"airtableId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "airtable-clone_at_view" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"airtableId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "airtable-clone_airtable" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"baseId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "airtable-clone_base" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"ownerId" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "airtable-clone_session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "airtable-clone_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "airtable-clone_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "airtable-clone_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "airtable-clone_view_display" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"viewId" uuid NOT NULL,
	"columnId" uuid NOT NULL,
	"displayOrderNum" integer NOT NULL,
	"isHidden" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "airtable-clone_view_sort" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"viewId" uuid NOT NULL,
	"columnId" uuid NOT NULL,
	"sortOrder" text NOT NULL,
	"sortPriority" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "airtable-clone_account" ADD CONSTRAINT "airtable-clone_account_userId_airtable-clone_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."airtable-clone_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airtable-clone_at_column" ADD CONSTRAINT "airtable-clone_at_column_airtableId_airtable-clone_airtable_id_fk" FOREIGN KEY ("airtableId") REFERENCES "public"."airtable-clone_airtable"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airtable-clone_at_row" ADD CONSTRAINT "airtable-clone_at_row_airtableId_airtable-clone_airtable_id_fk" FOREIGN KEY ("airtableId") REFERENCES "public"."airtable-clone_airtable"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airtable-clone_at_view" ADD CONSTRAINT "airtable-clone_at_view_airtableId_airtable-clone_airtable_id_fk" FOREIGN KEY ("airtableId") REFERENCES "public"."airtable-clone_airtable"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airtable-clone_airtable" ADD CONSTRAINT "airtable-clone_airtable_baseId_airtable-clone_base_id_fk" FOREIGN KEY ("baseId") REFERENCES "public"."airtable-clone_base"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airtable-clone_base" ADD CONSTRAINT "airtable-clone_base_ownerId_airtable-clone_user_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."airtable-clone_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airtable-clone_session" ADD CONSTRAINT "airtable-clone_session_userId_airtable-clone_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."airtable-clone_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airtable-clone_view_display" ADD CONSTRAINT "airtable-clone_view_display_viewId_airtable-clone_at_view_id_fk" FOREIGN KEY ("viewId") REFERENCES "public"."airtable-clone_at_view"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airtable-clone_view_display" ADD CONSTRAINT "airtable-clone_view_display_columnId_airtable-clone_at_column_id_fk" FOREIGN KEY ("columnId") REFERENCES "public"."airtable-clone_at_column"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airtable-clone_view_sort" ADD CONSTRAINT "airtable-clone_view_sort_viewId_airtable-clone_at_view_id_fk" FOREIGN KEY ("viewId") REFERENCES "public"."airtable-clone_at_view"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airtable-clone_view_sort" ADD CONSTRAINT "airtable-clone_view_sort_columnId_airtable-clone_at_column_id_fk" FOREIGN KEY ("columnId") REFERENCES "public"."airtable-clone_at_column"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "airtable-clone_account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "t_user_id_idx" ON "airtable-clone_session" USING btree ("userId");