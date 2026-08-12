"use server";

export type AuthFormState = {
  ok: boolean;
  message: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
    name?: string[];
  };
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validateEmail(email: string) {
  if (!email) return ["Email is required."];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return ["Enter a valid email address."];
  }
  return [];
}

function validatePassword(password: string) {
  if (!password) return ["Password is required."];
  if (password.length < 8) {
    return ["Password must be at least 8 characters."];
  }
  return [];
}

/**
 * Auth is intentionally not implemented yet.
 * Forms validate input and return a clear "not enabled" response.
 */
export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getString(formData, "email");
  const password = getString(formData, "password");

  const fieldErrors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (fieldErrors.email.length || fieldErrors.password.length) {
    return {
      ok: false,
      message: "Please fix the errors below.",
      fieldErrors,
    };
  }

  return {
    ok: false,
    message: "Authentication is not enabled yet. Login UI is ready for wiring.",
  };
}

export async function signupAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = getString(formData, "name");
  const email = getString(formData, "email");
  const password = getString(formData, "password");

  const fieldErrors = {
    name: name ? [] : ["Name is required."],
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (
    fieldErrors.name.length ||
    fieldErrors.email.length ||
    fieldErrors.password.length
  ) {
    return {
      ok: false,
      message: "Please fix the errors below.",
      fieldErrors,
    };
  }

  return {
    ok: false,
    message:
      "Authentication is not enabled yet. Signup UI is ready for wiring.",
  };
}
