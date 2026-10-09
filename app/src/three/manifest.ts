// The CC0 assets in public/models and public/textures (see scripts/fetch-assets.mjs).

export const MODEL_NAMES = ["aircon", "drum", "planter", "plant", "chair", "lantern"] as const;
export const TEXTURE_NAMES = ["plaster_normal", "plaster_rough", "slab_diff", "slab_normal", "lane_diff"] as const;

export type ModelName = (typeof MODEL_NAMES)[number];
export type TextureName = (typeof TEXTURE_NAMES)[number];
