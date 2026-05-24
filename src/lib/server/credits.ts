import { updateUserByEmailWithInc } from "@/lib/server/store";
import { logToTerminal } from "@/lib/server/logger";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function updateUserCredits(email: string, amount: number) {
  try {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      throw new Error("Missing user email for credit update.");
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Credit amount must be a positive number.");
    }

    const creditUpdate = {
      $inc: {
        credits: Math.trunc(amount),
      },
      $set: {
        premium: true,
      },
    };

    const user = updateUserByEmailWithInc(normalizedEmail, creditUpdate);
    logToTerminal(`Credits updated for ${normalizedEmail}: +${creditUpdate.$inc.credits}`);
    return user;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown credit update error.";
    logToTerminal(`Failed to update user credits: ${message}`);
    throw error;
  }
}
