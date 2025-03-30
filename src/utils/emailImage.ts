import crypto from "crypto";

function getGravatarUrl(email: string, size: number = 200): string {
  const emailHash = crypto
    .createHash("md5")
    .update(email.trim().toLowerCase())
    .digest("hex");
  return `https://www.gravatar.com/avatar/${emailHash}?s=${size}&d=identicon`;
}

export default getGravatarUrl;
