import "@/drizzle/envConfig";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import * as schema from "./schema";
import { users, userendorsements } from "./schema";
import { eq, desc, count } from "drizzle-orm";

import { UserEndorsements, Users } from "@/lib/utils/types";

export const db = drizzle(sql, { schema });

export const getUsers = async () => {
  return db.query.users.findMany();
};

export const insertUser = async (
  userData: Omit<typeof users.$inferInsert, "id" | "createdAt" | "updatedAt">
) => {
  console.log("Inserting user data:", userData);
  const result = await db.insert(users).values(userData).returning();
  console.log("Insert result:", result);
  return result[0];
};

export const insertEndorsement = async (
  endorsementData: Omit<
    typeof userendorsements.$inferInsert,
    "id" | "createdAt"
  >
) => {
  console.log("Inserting endorsement data:", endorsementData);
  const result = await db
    .insert(userendorsements)
    .values(endorsementData)
    .returning();
  console.log("Insert result:", result);
  return result[0];
};

export const getEndorsementsRecievedByUsername = async (username: string) => {
  try {
    const endorsementsList = await db
      .select({
        id: userendorsements.id,
        recipientId: userendorsements.recipientId,
        recipientname: userendorsements.recipientname,
        endorserId: userendorsements.endorserId,
        endorserName: users.username,
        endorserAvatar: users.image,
        endorsername: userendorsements.endorsername,
        ecc: userendorsements.ecc,
        oprd: userendorsements.oprd,
        optooling: userendorsements.optooling,
        attestationuid: userendorsements.attestationuid,
        createdAt: userendorsements.createdAt,
      })
      .from(userendorsements)
      .innerJoin(users, eq(userendorsements.endorserId, users.id))
      .where(eq(userendorsements.recipientname, username))
      .orderBy(desc(userendorsements.createdAt));

    return endorsementsList;
  } catch (error) {
    console.error("Error fetching endorsements:", error);
    throw error;
  }
};

export const getEndorsementsGivenByUsername = async (username: string) => {
  try {
    const endorsementsList = await db
      .select({
        id: userendorsements.id,
        recipientId: userendorsements.recipientId,
        recipientname: userendorsements.recipientname,
        endorserId: userendorsements.endorserId,
        endorserName: users.username,
        endorserAvatar: users.image,
        endorsername: userendorsements.endorsername,
        ecc: userendorsements.ecc,
        oprd: userendorsements.oprd,
        optooling: userendorsements.optooling,
        attestationuid: userendorsements.attestationuid,
        createdAt: userendorsements.createdAt,
      })
      .from(userendorsements)
      .innerJoin(users, eq(userendorsements.recipientId, users.id))
      .where(eq(userendorsements.endorsername, username))
      .orderBy(desc(userendorsements.createdAt));

    return endorsementsList;
  } catch (error) {
    console.error("Error fetching endorsements:", error);
    throw error;
  }
};

export const getUserVerificationStatus = async (username: string) => {
  try {
    const user = await db
      .select({
        verified: users.verified,
      })
      .from(users)
      .where(eq(users.username, username));

    return user[0];
  } catch (error) {
    console.error("Error fetching user verification status:", error);
    throw error;
  }
};

export const getUserDataWithEndorsements = async (githubName: string) => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, githubName))
    .limit(1);

  if (user.length === 0) {
    throw new Error("User not found");
  }

  const endorsementCount = await db
    .select({ count: count() })
    .from(userendorsements)
    .where(eq(userendorsements.recipientname, githubName));

  return {
    ...user[0],
    endorsementCount: endorsementCount[0].count,
  };
};
