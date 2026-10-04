const crypto = require("crypto");
const supabase = require("./db");

const KEY_PREFIX = "RBX";

function generateRawKey() {
  const part1 = crypto.randomBytes(6).toString("hex").toUpperCase();
  const part2 = crypto.randomBytes(6).toString("hex").toUpperCase();
  const part3 = crypto.randomBytes(6).toString("hex").toUpperCase();

  return `${KEY_PREFIX}-${part1}-${part2}-${part3}`;
}

function hashKey(key) {
  return crypto
    .createHash("sha256")
    .update(key)
    .digest("hex");
}

function getExpiration(duration) {
  if (duration === "unlimited") {
    return null;
  }

  const days = {
    "1d": 1,
    "7d": 7,
    "30d": 30
  }[duration];

  if (!days) {
    throw new Error("Durée invalide");
  }

  const expiration = new Date();

  expiration.setUTCDate(
    expiration.getUTCDate() + days
  );

  return expiration.toISOString();
}

async function createKey(duration, createdBy = "admin") {
  const key = generateRawKey();
  const keyHash = hashKey(key);
  const expiresAt = getExpiration(duration);

  const { data, error } = await supabase
    .from("keys")
    .insert({
      key_hash: keyHash,
      duration,
      status: "active",
      expires_at: expiresAt,
      created_by: createdBy
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    key,
    record: data
  };
}

async function verifyKey(key) {
  if (typeof key !== "string") {
    return {
      valid: false,
      reason: "invalid_format"
    };
  }

  const normalizedKey = key.trim().toUpperCase();

  if (!/^RBX-[A-F0-9]{12}-[A-F0-9]{12}-[A-F0-9]{12}$/.test(normalizedKey)) {
    return {
      valid: false,
      reason: "invalid_format"
    };
  }

  const keyHash = hashKey(normalizedKey);

  const { data, error } = await supabase
    .from("keys")
    .select("id,status,expires_at,duration")
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      valid: false,
      reason: "not_found"
    };
  }

  if (data.status === "revoked") {
    return {
      valid: false,
      reason: "revoked"
    };
  }

  if (
    data.expires_at &&
    new Date(data.expires_at).getTime() <= Date.now()
  ) {
    return {
      valid: false,
      reason: "expired"
    };
  }

  return {
    valid: true,
    expiresAt: data.expires_at,
    duration: data.duration
  };
}

async function revokeKey(id) {
  const { data, error } = await supabase
    .from("keys")
    .update({
      status: "revoked"
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function listKeys() {
  const { data, error } = await supabase
    .from("keys")
    .select("id,key_hash,duration,status,created_at,expires_at,created_by")
    .order("created_at", {
      ascending: false
    });

  if (error) {
    throw error;
  }

  return data;
}

module.exports = {
  createKey,
  verifyKey,
  revokeKey,
  listKeys
};
