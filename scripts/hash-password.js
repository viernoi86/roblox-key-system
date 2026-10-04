import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run hash-password -- "your-password"');
  process.exit(1);
}

if (password.length < 12) {
  console.error("Use an admin password of at least 12 characters.");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log("\nADMIN_PASSWORD_HASH=");
console.log(hash);
console.log("\nCopy the hash into your .env file.\n");
