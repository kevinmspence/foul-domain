import sql from '@/lib/sql';
import { randomUUID } from 'crypto';

export function CustomAdapter() {
  return {
    async createUser(user) {
      const id = randomUUID();
      const result = await sql`
        INSERT INTO "User" (id, name, email, image)
        VALUES (${id}, ${user.name}, ${user.email}, ${user.image})
        RETURNING *;
      `;
      return result[0];
    },

    async getUser(id) {
      const result = await sql`
        SELECT * FROM "User" WHERE id = ${id};
      `;
      return result[0] || null;
    },

    async getUserByEmail(email) {
      const result = await sql`
        SELECT * FROM "User" WHERE email = ${email};
      `;
      return result[0] || null;
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const result = await sql`
        SELECT u.* FROM "User" u
        JOIN "Account" a ON a.userid = u.id
        WHERE a.provider = ${provider} AND a.providerAccountId = ${providerAccountId};
      `;
      return result[0] || null;
    },

    async updateUser(user) {
      const result = await sql`
        UPDATE "User"
        SET name = ${user.name}, email = ${user.email}, image = ${user.image}
        WHERE id = ${user.id}
        RETURNING *;
      `;
      return result[0];
    },

    async deleteUser(userId) {
      await sql`
        DELETE FROM "User" WHERE id = ${userId};
      `;
    },

    async linkAccount(account) {
      await sql`
        INSERT INTO "Account" (
          userid,
          provider,
          providerAccountId,
          type,
          access_token,
          expires_at,
          refresh_token,
          scope,
          token_type,
          id_token,
          session_state
        )
        VALUES (
          ${account.userId},
          ${account.provider},
          ${account.providerAccountId},
          ${account.type},
          ${account.access_token},
          ${account.expires_at},
          ${account.refresh_token},
          ${account.scope},
          ${account.token_type},
          ${account.id_token},
          ${account.session_state}
        );
      `;
    },

    async unlinkAccount({ provider, providerAccountId }) {
      await sql`
        DELETE FROM "Account"
        WHERE provider = ${provider} AND providerAccountId = ${providerAccountId};
      `;
    },

    async createSession(session) {
      await sql`
        INSERT INTO "Session" (sessionToken, userId, expires)
        VALUES (${session.sessionToken}, ${session.userId}, ${session.expires});
      `;
      return session;
    },

    async getSessionAndUser(sessionToken) {
      const result = await sql`
        SELECT s.*, u.*
        FROM "Session" s
        JOIN "User" u ON s.userId = u.id
        WHERE s.sessionToken = ${sessionToken};
      `;

      if (result.length === 0) return null;

      const row = result[0];

      const session = {
        sessionToken: row.sessiontoken,
        userId: row.userid,
        expires: row.expires,
      };

      const user = {
        id: row.id,
        name: row.name,
        email: row.email,
        image: row.image,
      };

      return { session, user };
    },

    async updateSession(session) {
      await sql`
        UPDATE "Session"
        SET expires = ${session.expires}, userId = ${session.userId}
        WHERE sessionToken = ${session.sessionToken};
      `;
      return session;
    },

    async deleteSession(sessionToken) {
      await sql`
        DELETE FROM "Session" WHERE sessionToken = ${sessionToken};
      `;
    },

    async createVerificationToken(token) {},
    async useVerificationToken({ identifier, token }) {},
  };
}
