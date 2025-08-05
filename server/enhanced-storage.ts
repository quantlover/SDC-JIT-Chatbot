import {
  users,
  conversations,
  messages,
  messageReactions,
  bookmarks,
  knowledgeBase,
  searchQueries,
  analytics,
  systemSettings,
  type User,
  type Conversation,
  type Message,
  type MessageReaction,
  type Bookmark,
  type KnowledgeBaseItem,
  type AnalyticsEvent,
  type SystemSetting,
  type InsertUser,
  type InsertConversation,
  type InsertMessage,
  type InsertReaction,
  type InsertBookmark,
  type InsertKnowledgeBase,
  type InsertAnalytics,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, or, sql, count, asc, inArray } from "drizzle-orm";

export interface IEnhancedStorage {
  // User Management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  updateUserPreferences(id: string, preferences: any): Promise<User | undefined>;
  
  // Conversation Management
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByUserId(userId: string): Promise<Conversation[]>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined>;
  deleteConversation(id: string): Promise<boolean>;
  searchConversations(userId: string, query: string): Promise<Conversation[]>;
  getBookmarkedConversations(userId: string): Promise<Conversation[]>;
  
  // Message Management
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByConversationId(conversationId: string): Promise<Message[]>;
  getRecentMessages(conversationId: string, limit?: number): Promise<Message[]>;
  updateMessage(id: string, updates: Partial<Message>): Promise<Message | undefined>;
  deleteMessage(id: string): Promise<boolean>;
  searchMessages(userId: string, query: string): Promise<Message[]>;
  
  // Reaction System
  addReaction(reaction: InsertReaction): Promise<MessageReaction>;
  removeReaction(messageId: string, userId: string): Promise<boolean>;
  getMessageReactions(messageId: string): Promise<MessageReaction[]>;
  getUserReaction(messageId: string, userId: string): Promise<MessageReaction | undefined>;
  
  // Bookmark System
  addBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  removeBookmark(id: string): Promise<boolean>;
  getUserBookmarks(userId: string): Promise<Bookmark[]>;
  isBookmarked(userId: string, messageId?: string, conversationId?: string): Promise<boolean>;
  
  // Knowledge Base
  getKnowledgeBaseItems(): Promise<KnowledgeBaseItem[]>;
  searchKnowledgeBase(query: string): Promise<KnowledgeBaseItem[]>;
  createKnowledgeBaseItem(item: InsertKnowledgeBase): Promise<KnowledgeBaseItem>;
  updateKnowledgeBaseItem(id: string, updates: Partial<KnowledgeBaseItem>): Promise<KnowledgeBaseItem | undefined>;
  incrementKnowledgeBaseViewCount(id: string): Promise<void>;
  
  // Analytics
  trackEvent(event: InsertAnalytics): Promise<AnalyticsEvent>;
  getAnalytics(filters: { eventType?: string; userId?: string; startDate?: Date; endDate?: Date }): Promise<AnalyticsEvent[]>;
  getUserAnalytics(userId: string): Promise<{ totalChats: number; totalBookmarks: number; favoriteTopics: string[] }>;
  getPopularQueries(limit?: number): Promise<{ query: string; count: number }[]>;
  
  // Search & Query Tracking
  trackSearchQuery(userId: string | undefined, query: string, resultCount: number, wasSuccessful: boolean): Promise<void>;
  getSearchSuggestions(query: string): Promise<string[]>;
  
  // System Settings
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  setSystemSetting(key: string, value: string, description?: string, updatedBy?: string): Promise<SystemSetting>;
  getAllSystemSettings(): Promise<SystemSetting[]>;
}

export class DatabaseStorage implements IEnhancedStorage {
  // User Management
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPreferences(id: string, preferences: any): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ preferences, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Conversation Management
  async createConversation(conversationData: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values({
        ...conversationData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return conversation;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return conversation;
  }

  async deleteConversation(id: string): Promise<boolean> {
    const result = await db.delete(conversations).where(eq(conversations.id, id));
    return result.rowCount > 0;
  }

  async searchConversations(userId: string, query: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.userId, userId),
          or(
            like(conversations.title, `%${query}%`),
            like(conversations.summary, `%${query}%`)
          )
        )
      )
      .orderBy(desc(conversations.updatedAt));
  }

  async getBookmarkedConversations(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.userId, userId),
          eq(conversations.isBookmarked, true)
        )
      )
      .orderBy(desc(conversations.updatedAt));
  }

  // Message Management
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values({
        ...messageData,
        createdAt: new Date(),
      })
      .returning();

    // Update conversation stats
    await db
      .update(conversations)
      .set({
        lastMessageAt: new Date(),
        messageCount: sql`${conversations.messageCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, messageData.conversationId));

    return message;
  }

  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));
  }

  async getRecentMessages(conversationId: string, limit: number = 10): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
  }

  async updateMessage(id: string, updates: Partial<Message>): Promise<Message | undefined> {
    const [message] = await db
      .update(messages)
      .set(updates)
      .where(eq(messages.id, id))
      .returning();
    return message;
  }

  async deleteMessage(id: string): Promise<boolean> {
    const result = await db.delete(messages).where(eq(messages.id, id));
    return result.rowCount > 0;
  }

  async searchMessages(userId: string, query: string): Promise<Message[]> {
    return await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        role: messages.role,
        content: messages.content,
        messageType: messages.messageType,
        metadata: messages.metadata,
        fileAttachments: messages.fileAttachments,
        audioTranscript: messages.audioTranscript,
        responseTime: messages.responseTime,
        tokenCount: messages.tokenCount,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(
        and(
          eq(conversations.userId, userId),
          or(
            like(messages.content, `%${query}%`),
            like(messages.audioTranscript, `%${query}%`)
          )
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  // Reaction System
  async addReaction(reactionData: InsertReaction): Promise<MessageReaction> {
    // Remove existing reaction from this user on this message
    await db
      .delete(messageReactions)
      .where(
        and(
          eq(messageReactions.messageId, reactionData.messageId),
          eq(messageReactions.userId, reactionData.userId!)
        )
      );

    const [reaction] = await db
      .insert(messageReactions)
      .values({
        ...reactionData,
        createdAt: new Date(),
      })
      .returning();
    return reaction;
  }

  async removeReaction(messageId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(messageReactions)
      .where(
        and(
          eq(messageReactions.messageId, messageId),
          eq(messageReactions.userId, userId)
        )
      );
    return result.rowCount > 0;
  }

  async getMessageReactions(messageId: string): Promise<MessageReaction[]> {
    return await db
      .select()
      .from(messageReactions)
      .where(eq(messageReactions.messageId, messageId));
  }

  async getUserReaction(messageId: string, userId: string): Promise<MessageReaction | undefined> {
    const [reaction] = await db
      .select()
      .from(messageReactions)
      .where(
        and(
          eq(messageReactions.messageId, messageId),
          eq(messageReactions.userId, userId)
        )
      );
    return reaction;
  }

  // Bookmark System
  async addBookmark(bookmarkData: InsertBookmark): Promise<Bookmark> {
    const [bookmark] = await db
      .insert(bookmarks)
      .values({
        ...bookmarkData,
        createdAt: new Date(),
      })
      .returning();
    return bookmark;
  }

  async removeBookmark(id: string): Promise<boolean> {
    const result = await db.delete(bookmarks).where(eq(bookmarks.id, id));
    return result.rowCount > 0;
  }

  async getUserBookmarks(userId: string): Promise<Bookmark[]> {
    return await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt));
  }

  async isBookmarked(userId: string, messageId?: string, conversationId?: string): Promise<boolean> {
    const conditions = [eq(bookmarks.userId, userId)];
    
    if (messageId) {
      conditions.push(eq(bookmarks.messageId, messageId));
    }
    if (conversationId) {
      conditions.push(eq(bookmarks.conversationId, conversationId));
    }

    const [bookmark] = await db
      .select()
      .from(bookmarks)
      .where(and(...conditions))
      .limit(1);
    
    return !!bookmark;
  }

  // Knowledge Base
  async getKnowledgeBaseItems(): Promise<KnowledgeBaseItem[]> {
    return await db
      .select()
      .from(knowledgeBase)
      .where(eq(knowledgeBase.isActive, true))
      .orderBy(desc(knowledgeBase.viewCount));
  }

  async searchKnowledgeBase(query: string): Promise<KnowledgeBaseItem[]> {
    return await db
      .select()
      .from(knowledgeBase)
      .where(
        and(
          eq(knowledgeBase.isActive, true),
          or(
            like(knowledgeBase.title, `%${query}%`),
            like(knowledgeBase.content, `%${query}%`),
            sql`${knowledgeBase.keywords}::text LIKE ${'%' + query + '%'}`
          )
        )
      )
      .orderBy(desc(knowledgeBase.viewCount));
  }

  async createKnowledgeBaseItem(itemData: InsertKnowledgeBase): Promise<KnowledgeBaseItem> {
    const [item] = await db
      .insert(knowledgeBase)
      .values({
        ...itemData,
        createdAt: new Date(),
        lastUpdated: new Date(),
      })
      .returning();
    return item;
  }

  async updateKnowledgeBaseItem(id: string, updates: Partial<KnowledgeBaseItem>): Promise<KnowledgeBaseItem | undefined> {
    const [item] = await db
      .update(knowledgeBase)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(knowledgeBase.id, id))
      .returning();
    return item;
  }

  async incrementKnowledgeBaseViewCount(id: string): Promise<void> {
    await db
      .update(knowledgeBase)
      .set({ viewCount: sql`${knowledgeBase.viewCount} + 1` })
      .where(eq(knowledgeBase.id, id));
  }

  // Analytics
  async trackEvent(eventData: InsertAnalytics): Promise<AnalyticsEvent> {
    const [event] = await db
      .insert(analytics)
      .values({
        ...eventData,
        timestamp: new Date(),
      })
      .returning();
    return event;
  }

  async getAnalytics(filters: {
    eventType?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AnalyticsEvent[]> {
    const conditions = [];
    
    if (filters.eventType) {
      conditions.push(eq(analytics.eventType, filters.eventType));
    }
    if (filters.userId) {
      conditions.push(eq(analytics.userId, filters.userId));
    }
    if (filters.startDate) {
      conditions.push(sql`${analytics.timestamp} >= ${filters.startDate}`);
    }
    if (filters.endDate) {
      conditions.push(sql`${analytics.timestamp} <= ${filters.endDate}`);
    }

    return await db
      .select()
      .from(analytics)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(analytics.timestamp));
  }

  async getUserAnalytics(userId: string): Promise<{
    totalChats: number;
    totalBookmarks: number;
    favoriteTopics: string[];
  }> {
    const [chatCount] = await db
      .select({ count: count() })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(and(eq(conversations.userId, userId), eq(messages.role, 'user')));

    const [bookmarkCount] = await db
      .select({ count: count() })
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId));

    // Get favorite topics from search queries
    const topQueries = await db
      .select({ query: searchQueries.query, count: count() })
      .from(searchQueries)
      .where(eq(searchQueries.userId, userId))
      .groupBy(searchQueries.query)
      .orderBy(desc(count()))
      .limit(5);

    return {
      totalChats: chatCount.count,
      totalBookmarks: bookmarkCount.count,
      favoriteTopics: topQueries.map(q => q.query),
    };
  }

  async getPopularQueries(limit: number = 10): Promise<{ query: string; count: number }[]> {
    return await db
      .select({ query: searchQueries.query, count: count() })
      .from(searchQueries)
      .where(eq(searchQueries.wasSuccessful, true))
      .groupBy(searchQueries.query)
      .orderBy(desc(count()))
      .limit(limit);
  }

  // Search & Query Tracking
  async trackSearchQuery(
    userId: string | undefined,
    query: string,
    resultCount: number,
    wasSuccessful: boolean
  ): Promise<void> {
    await db.insert(searchQueries).values({
      userId,
      query,
      resultCount,
      wasSuccessful,
      createdAt: new Date(),
    });
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    const suggestions = await db
      .select({ query: searchQueries.query })
      .from(searchQueries)
      .where(
        and(
          like(searchQueries.query, `%${query}%`),
          eq(searchQueries.wasSuccessful, true)
        )
      )
      .groupBy(searchQueries.query)
      .orderBy(desc(count()))
      .limit(5);

    return suggestions.map(s => s.query);
  }

  // System Settings
  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key));
    return setting;
  }

  async setSystemSetting(
    key: string,
    value: string,
    description?: string,
    updatedBy?: string
  ): Promise<SystemSetting> {
    const [setting] = await db
      .insert(systemSettings)
      .values({
        key,
        value,
        description,
        updatedBy,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: {
          value,
          description,
          updatedBy,
          updatedAt: new Date(),
        },
      })
      .returning();
    return setting;
  }

  async getAllSystemSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings).orderBy(systemSettings.key);
  }
}

export const enhancedStorage = new DatabaseStorage();