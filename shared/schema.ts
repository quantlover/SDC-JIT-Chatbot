import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, boolean, integer, real, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const messageTypeEnum = pgEnum('message_type', ['chat', 'file_upload', 'voice']);
export const reactionTypeEnum = pgEnum('reaction_type', ['like', 'dislike', 'helpful', 'not_helpful']);
export const userRoleEnum = pgEnum('user_role', ['student', 'faculty', 'admin']);
export const themeEnum = pgEnum('theme', ['light', 'dark', 'auto']);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  username: text("username").notNull().unique(),
  password: text("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: userRoleEnum("role").default('student'),
  profileImageUrl: varchar("profile_image_url"),
  learningSociety: varchar("learning_society"), // Jane Adams, John Dewey, etc.
  academicYear: varchar("academic_year"), // M1, MCE, LCE
  preferences: json("preferences").default({}), // Theme, notification settings, etc.
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title"),
  tags: json("tags").default([]), // For categorization
  isBookmarked: boolean("is_bookmarked").default(false),
  summary: text("summary"), // Auto-generated conversation summary
  messageCount: integer("message_count").default(0),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  messageType: messageTypeEnum("message_type").default('chat'),
  metadata: json("metadata"), // For storing additional data like quick actions, etc.
  fileAttachments: json("file_attachments").default([]), // File upload metadata
  audioTranscript: text("audio_transcript"), // For voice messages
  responseTime: integer("response_time"), // AI response time in ms
  tokenCount: integer("token_count"), // For cost tracking
  createdAt: timestamp("created_at").defaultNow(),
});

// New tables for enhanced features
export const messageReactions = pgTable("message_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull().references(() => messages.id),
  userId: varchar("user_id").references(() => users.id),
  reactionType: reactionTypeEnum("reaction_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  messageId: varchar("message_id").references(() => messages.id),
  conversationId: varchar("conversation_id").references(() => conversations.id),
  title: text("title"),
  description: text("description"),
  tags: json("tags").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const knowledgeBase = pgTable("knowledge_base", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  url: varchar("url"),
  section: varchar("section").notNull(),
  keywords: json("keywords").default([]),
  isActive: boolean("is_active").default(true),
  viewCount: integer("view_count").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const searchQueries = pgTable("search_queries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  query: text("query").notNull(),
  resultCount: integer("result_count"),
  wasSuccessful: boolean("was_successful").default(false),
  metadata: json("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: varchar("event_type").notNull(), // chat_message, file_upload, bookmark, etc.
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  data: json("data").default({}),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  conversations: many(conversations),
  bookmarks: many(bookmarks),
  reactions: many(messageReactions),
  searchQueries: many(searchQueries),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, { fields: [conversations.userId], references: [users.id] }),
  messages: many(messages),
  bookmarks: many(bookmarks),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
  reactions: many(messageReactions),
  bookmarks: many(bookmarks),
}));

export const messageReactionsRelations = relations(messageReactions, ({ one }) => ({
  message: one(messages, { fields: [messageReactions.messageId], references: [messages.id] }),
  user: one(users, { fields: [messageReactions.userId], references: [users.id] }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, { fields: [bookmarks.userId], references: [users.id] }),
  message: one(messages, { fields: [bookmarks.messageId], references: [messages.id] }),
  conversation: one(conversations, { fields: [bookmarks.conversationId], references: [conversations.id] }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  messageCount: true,
  lastMessageAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
  createdAt: true,
});

export const insertReactionSchema = createInsertSchema(messageReactions).omit({
  id: true,
  createdAt: true,
});

export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit({
  id: true,
  createdAt: true,
  viewCount: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  timestamp: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type MessageReaction = typeof messageReactions.$inferSelect;
export type InsertKnowledgeBase = z.infer<typeof insertKnowledgeBaseSchema>;
export type KnowledgeBaseItem = typeof knowledgeBase.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type AnalyticsEvent = typeof analytics.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;
