import crypto from "crypto";

export type HmacAlgorithm = "sha1" | "sha256" | "sha512";

export function verifyHmacSignature({
  header,
  secret,
  payload,
  algorithms,
}: {
  header: string;
  secret: string;
  payload: string;
  algorithms: readonly HmacAlgorithm[];
}) {
  const tokens = parseSignatureHeader(header);
  return algorithms.some((algorithm) => {
    const provided = tokens[algorithm];
    if (!provided) return false;
    const expected = crypto.createHmac(algorithm, secret).update(payload).digest("hex");
    return timingSafeEqual(provided.toLowerCase(), expected.toLowerCase());
  });
}

export function parseSignatureHeader(header: string) {
  return header.split(/[, ]+/).reduce(
    (acc, part) => {
      const [algorithm, value] = part.split("=");
      if (algorithm && value) {
        acc[algorithm.trim().toLowerCase()] = value.trim();
      }
      return acc;
    },
    {} as Record<string, string>,
  );
}

function timingSafeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}
