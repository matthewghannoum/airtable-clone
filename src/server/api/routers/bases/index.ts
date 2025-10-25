import { createTRPCRouter } from "@/server/api/trpc";
import createBase from "./mutations/createBase";
import updateBaseName from "./mutations/updateBaseName";
import addTableToBase from "./mutations/addTableToBase";

export const basesRouter = createTRPCRouter({
  create: createBase,
  updateName: updateBaseName,
  addTable: addTableToBase,
});
