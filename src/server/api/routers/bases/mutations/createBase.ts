import { protectedProcedure } from "@/server/api/trpc";
import { bases } from "@/server/db/schema";
import addNewTable from "../utils/addNewTable";

const createBase = protectedProcedure.mutation(async ({ ctx }) => {
  const { user } = ctx.session;

  const userId = user.id;

  if (typeof userId !== "string") {
    throw new Error("No user ID in session");
  }

  const { baseId, tableId } = await ctx.db.transaction(async (tx) => {
    // Type assertion for the returned row, adjust as per your schema
    const [baseRow] = await tx
      .insert(bases)
      .values({
        name: "Untitled Base",
        ownerId: userId,
      })
      .returning();

    if (!baseRow) {
      throw new Error("Failed to create base");
    }

    const airtableId = await addNewTable(baseRow.id, "Table 1", tx);

    return { baseId: baseRow.id, tableId: airtableId };
  });

  return { baseId, tableId };
});

export default createBase;
