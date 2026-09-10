import { useState } from "react";

import { StatusPanel } from "../../shared/ui/index.js";

import { createUser } from "./user.api.js";
import { CREATE_USER_SCHEMA } from "./user.schema.js";

import type { CreateUserInput, UserResponse } from "./user.types.js";
import type { SyntheticEvent } from "react";

export type CreateUserRequest = (input: CreateUserInput) => Promise<UserResponse>;

interface CreateUserFormProps {
  readonly createUserRequest?: CreateUserRequest;
  readonly onCreated: (user: UserResponse) => void;
  readonly organizationId: string;
}

type FormStatus = "error" | "idle" | "submitting" | "success";

export function CreateUserForm({
  createUserRequest = createUser,
  onCreated,
  organizationId,
}: CreateUserFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [status, setStatus] = useState<FormStatus>("idle");

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const result = CREATE_USER_SCHEMA.safeParse({
      displayName,
      email,
      organizationId,
    });

    if (!result.success) {
      setErrorMessage(result.error.issues[0]?.message ?? "Check the form fields.");
      setStatus("error");
      return;
    }

    setErrorMessage(undefined);
    setStatus("submitting");

    try {
      const user = await createUserRequest(result.data);
      setDisplayName("");
      setEmail("");
      setStatus("success");
      onCreated(user);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create user.");
      setStatus("error");
    }
  }

  return (
    <form
      className="create-user-form"
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
    >
      <div className="form-field">
        <label htmlFor="display-name">Display name</label>
        <input
          id="display-name"
          onChange={(event) => {
            setDisplayName(event.target.value);
          }}
          required
          type="text"
          value={displayName}
        />
      </div>
      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          onChange={(event) => {
            setEmail(event.target.value);
          }}
          required
          type="email"
          value={email}
        />
      </div>
      <button disabled={status === "submitting"} type="submit">
        {status === "submitting" ? "Creating…" : "Create user"}
      </button>
      {errorMessage === undefined && status === "success" ? (
        <StatusPanel>User created.</StatusPanel>
      ) : null}
      {errorMessage === undefined ? null : <StatusPanel tone="error">{errorMessage}</StatusPanel>}
    </form>
  );
}
