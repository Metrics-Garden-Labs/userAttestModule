import "@/drizzle/envConfig";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import * as schema from "./schema";
import { users, userendorsements } from "./schema";
import { eq, desc } from "drizzle-orm";

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

export const getEndorsementsByUsername = async (username: string) => {
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
