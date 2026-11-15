import { randomBytes, scryptSync } from "node:crypto";

if (!process.stdin.isTTY || !process.stdin.setRawMode) {
  console.error("Run this command in an interactive terminal so the password can be entered privately.");
  process.exit(1);
}

process.stdout.write("Enter a new admin password (minimum 12 characters): ");
process.stdin.setRawMode(true);
process.stdin.setEncoding("utf8");
process.stdin.resume();

let password = "";
const finish = () => {
  process.stdin.setRawMode(false);
  process.stdin.pause();
  process.stdout.write("\n");
};

process.stdin.on("data", (chunk) => {
  for (const character of chunk) {
    if (character === "\u0003") {
      finish();
      process.exit(1);
    }
    if (character === "\r" || character === "\n") {
      finish();
      if (password.length < 12) {
        console.error("Password must contain at least 12 characters.");
        process.exit(1);
      }
      const salt = randomBytes(16);
      const hash = scryptSync(password, salt, 64);
      password = "";
      console.log(`ADMIN_PASSWORD_HASH=${salt.toString("hex")}:${hash.toString("hex")}`);
      process.exit(0);
    }
    if (character === "\u007f" || character === "\b") {
      password = password.slice(0, -1);
    } else {
      password += character;
    }
  }
});
