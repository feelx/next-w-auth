"use client";
import { signIn } from "@root/auth";

export function SignIn() {
  return (
    <form
      action={async (formData) => {
        try {
          await signIn("credentials", formData);
        } catch (error) {
          console.error(`Sign in failed: ${error}`);
        }
      }}
    >
      <label htmlFor="email">Email</label>
      <input name="email" type="email" />
      <label htmlFor="password">Password</label>
      <input name="password" type="password" />
      <SignInButton />
    </form>
  );
}
