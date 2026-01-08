// services/artwork/utils/io.js
import { ENV } from "../../../scripts/envBootstrap.js";
import { uploadBuffer, putJson } from "../../shared/utils/r2-client.js";
import { info, error } from "../../../logger.js";

const ART_BUCKET  = ENV.r2.buckets.art;
const META_BUCKET = ENV.r2.buckets.meta;
const ART_PUBLIC  = ENV.r2.publicBase.art;

function requireEnv(name, val) {
  if (!val) throw new Error(`Missing required env: ${name}`);
  return val;
}

export async function saveArtworkPng(pngBuffer, key, meta = null) {
  const bucket = requireEnv("R2_BUCKET_ART", ART_BUCKET);
  const publicBase = requireEnv("R2_PUBLIC_BASE_URL_ART", ART_PUBLIC);

  if (!pngBuffer || !key) throw new Error("saveArtworkPng requires both pngBuffer and key");

  try {
    await uploadBuffer(bucket, key, pngBuffer, "image/png");
    info("artwork.r2.put", { bucket, key, bytes: pngBuffer.length });

    if (meta && META_BUCKET) {
      const metaKey = key.replace(/\.png$/i, ".json");
      await putJson(META_BUCKET, metaKey, meta);
      info("artwork.r2.meta.put", { bucket: META_BUCKET, key: metaKey });
    }

    return `${publicBase.replace(/\/+$/, "")}/${key.replace(/^\/+/, "")}`;
  } catch (err) {
    error("artwork.r2.upload.fail", { message: err.message, bucket, key });
    throw err;
  }
}
