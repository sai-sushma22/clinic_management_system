import bcrypt from "bcrypt";
import prisma from "../src/config/database.js";

const hashExistingPasswords = async () => {
  const users = await prisma.user.findMany();

  for (const user of users) {
    // Skip passwords that are already hashed
    if (user.password.startsWith("$2")) {
      continue;
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
  }

  console.log("Existing passwords hashed successfully");
};

hashExistingPasswords()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });