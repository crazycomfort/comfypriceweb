// Authentication utilities - Step 3

// Simple password hashing (in production, use bcrypt)
export function hashPassword(password: string): string {
  // STUB: In production, use proper bcrypt hashing
  // For now, simple base64 encoding (NOT SECURE - for development only)
  return Buffer.from(password).toString("base64");
}

export function verifyPassword(password: string, hash: string): boolean {
  // STUB: In production, use proper bcrypt verification
  const hashed = Buffer.from(password).toString("base64");
  return hashed === hash;
}

