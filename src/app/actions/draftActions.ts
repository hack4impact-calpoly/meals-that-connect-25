"use server";

import { bulkDeleteCombos, bulkPublishCombos, bulkPublishRecipes, bulkDeleteRecipes } from "@/database/db";
import { revalidatePath } from "next/cache";

export async function publishCombos(ids: string[]) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("No combos selected");
  }

  await bulkPublishCombos(ids);
}

export async function deleteCombos(ids: string[]) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("No combos selected");
  }

  await bulkDeleteCombos(ids);
}

export async function publishRecipes(ids: string[]) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("No recipes selected");
  }

  await bulkPublishRecipes(ids);
}

export async function deleteRecipes(ids: string[]) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("No recipes selected");
  }

  await bulkDeleteRecipes(ids);
}
