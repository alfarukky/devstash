import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { registerSchema } from "@/lib/auth-schemas";
import { prisma } from "@/lib/prisma";
import { issueVerificationEmail } from "@/lib/verification";

function emailTaken() {
  return NextResponse.json(
    { success: false, error: "An account with this email already exists" },
    { status: 409 },
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return emailTaken();

    const user = await prisma.user.create({
      data: { name, email, password: await bcrypt.hash(password, 12) },
      select: { id: true, name: true, email: true },
    });

    // The account exists either way; if sending fails, the user can request a new link.
    try {
      await issueVerificationEmail(user.email);
    } catch (error) {
      console.error("Verification email failed:", error);
    }

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    // A concurrent registration for the same email can pass the check above and then
    // hit the unique constraint on create.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return emailTaken();
    }
    console.error("Registration failed:", error);
    return NextResponse.json({ success: false, error: "Registration failed" }, { status: 500 });
  }
}
