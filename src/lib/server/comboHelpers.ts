import "server-only";

import Recipe from "@/database/RecipeSchema";
import Combo from "@/database/ComboSchema";
import { DIETARY_KEYS, EMPTY_DIETARY_FLAGS, EMPTY_EXCLUSION_FLAGS, EXCLUSION_KEYS, RECIPE_BUCKETS } from "@/lib/types";
import { emptyNutrition, sumNutrition } from "@/lib/nutrition";
import type {
  DietaryFlags,
  DietaryKey,
  ExclusionFlags,
  ExclusionKey,
  MealFilterFields,
  Nutrition,
  ProteinSource,
  RecipeBucket,
  RecipeBuckets,
} from "@/lib/types";

type RecipeFilterFields = {
  _id: string;
  proteinSources?: ProteinSource[];
  dietary?: Partial<Record<DietaryKey, boolean>>;
  exclusions?: Partial<Record<ExclusionKey, boolean>>;
  nutritional_info?: Partial<Nutrition>;
};

type ComboDerivedData = MealFilterFields & {
  nutritional_info: Nutrition;
};

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

export async function deriveComboDataFromRecipeIds(recipeBuckets: RecipeBuckets): Promise<ComboDerivedData> {
  // Used to aggregate the filters from all recipes in a combo
  // into one single filters object for the combo itself.
  const recipeIds = unique(RECIPE_BUCKETS.flatMap((bucket) => recipeBuckets[bucket] ?? []));

  if (recipeIds.length === 0) {
    return {
      proteinSources: [],
      dietary: { ...EMPTY_DIETARY_FLAGS },
      exclusions: { ...EMPTY_EXCLUSION_FLAGS },
      nutritional_info: emptyNutrition(),
    };
  }

  const recipes = await Recipe.find({ _id: { $in: recipeIds } })
    .select("_id proteinSources dietary exclusions nutritional_info")
    .lean<RecipeFilterFields[]>();

  if (recipes.length !== recipeIds.length) {
    // If stale recipes become a problem, could choose to remove
    // recipes that could not be found.
    throw new Error("One or more recipes in this combo could not be found.");
  }

  // Adds a protein type if ANY recipes have that protein type
  const proteinSources = unique(recipes.flatMap((recipe) => recipe.proteinSources ?? []));

  // Adds a dietary restriction if ALL recipes have that restriction
  const dietary = DIETARY_KEYS.reduce(
    (result, key) => {
      result[key] = recipes.every((recipe) => recipe.dietary?.[key] === true);
      return result;
    },
    { ...EMPTY_DIETARY_FLAGS } as DietaryFlags,
  );

  // Adds an exclusion if ALL recipes have that exclusion
  const exclusions = EXCLUSION_KEYS.reduce(
    (result, key) => {
      result[key] = recipes.every((recipe) => recipe.exclusions?.[key] === true);
      return result;
    },
    { ...EMPTY_EXCLUSION_FLAGS } as ExclusionFlags,
  );

  return {
    proteinSources,
    dietary,
    exclusions,
    nutritional_info: sumNutrition(recipes.map((recipe) => recipe.nutritional_info)),
  };
}

function getUpdatedRecipeBucket(
  updates: Record<string, unknown>,
  existingCombo: RecipeBuckets,
  bucket: RecipeBucket,
): string[] {
  // If this bucket (entrees, vegetables, etc) was updated, then use the updated version
  // if not, then use the version from the existing combo
  if (!(bucket in updates)) {
    return existingCombo[bucket] ?? [];
  }

  const value = updates[bucket];

  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`Invalid ${bucket} value`);
  }

  return value;
}

export function getFinalRecipeBuckets(updates: Record<string, unknown>, existingCombo: RecipeBuckets): RecipeBuckets {
  // When a combo is updated, we need to recalculate filters based on ALL the recipes in the combo.
  // This function will find all the recipes, which then can be fed into the accumulator helper.
  return {
    entrees: getUpdatedRecipeBucket(updates, existingCombo, "entrees"),
    vegetables: getUpdatedRecipeBucket(updates, existingCombo, "vegetables"),
    fruits: getUpdatedRecipeBucket(updates, existingCombo, "fruits"),
    grains: getUpdatedRecipeBucket(updates, existingCombo, "grains"),
  };
}

export function getRecipeBucketsFromBody(body: Record<string, unknown>): RecipeBuckets {
  const buckets = {} as RecipeBuckets;

  for (const bucket of RECIPE_BUCKETS) {
    const value = body[bucket];

    if (value == null) {
      buckets[bucket] = [];
      continue;
    }

    if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
      throw new Error(`Invalid ${bucket} value`);
    }

    buckets[bucket] = value;
  }

  return buckets;
}

type ComboRecipeBuckets = {
  _id: string;
} & RecipeBuckets;

function getRecipeBucketsFromCombo(combo: ComboRecipeBuckets): RecipeBuckets {
  return {
    entrees: combo.entrees ?? [],
    vegetables: combo.vegetables ?? [],
    fruits: combo.fruits ?? [],
    grains: combo.grains ?? [],
  };
}

export async function refreshCombosContainingRecipe(recipeId: string) {
  // Query for every combo containing this recipe in any bucket (entrees, Vegetables, etc)
  // Then, update the derived data for the combo.
  const combos = await Combo.find({
    $or: RECIPE_BUCKETS.map((bucket) => ({
      [bucket]: recipeId,
    })),
  })
    .select("_id entrees vegetables fruits grains")
    .lean<ComboRecipeBuckets[]>();

  if (combos.length === 0) {
    return {
      matchedCount: 0,
      modifiedCount: 0,
    };
  }

  await Promise.all(
    combos.map(async (combo) => {
      const recipeBuckets = getRecipeBucketsFromCombo(combo);
      const calculatedFilters = await deriveComboDataFromRecipeIds(recipeBuckets);

      await Combo.findByIdAndUpdate(
        combo._id,
        {
          $set: calculatedFilters,
        },
        {
          runValidators: true,
        },
      );
    }),
  );

  return {
    matchedCount: combos.length,
    modifiedCount: combos.length,
  };
}

export function updateAffectsComboData(updates: Record<string, unknown>) {
  return Object.keys(updates).some(
    (key) =>
      key === "proteinSources" ||
      key === "dietary" ||
      key === "exclusions" ||
      key === "nutritional_info" ||
      key.startsWith("dietary.") ||
      key.startsWith("exclusions.") ||
      key.startsWith("nutritional_info."),
  );
}
