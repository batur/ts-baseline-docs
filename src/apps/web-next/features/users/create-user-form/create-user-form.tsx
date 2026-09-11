"use client";

import { useForm } from "@tanstack/react-form";

import { Button, Input, Label } from "../../../shared/ui";
import { CREATE_USER_SCHEMA } from "../user.schema";

import type { CreateUserInput, UserResponse } from "../user.types";

export type CreateUserRequest = (input: CreateUserInput) => Promise<UserResponse>;

interface CreateUserFormProps {
  readonly createUserRequest: CreateUserRequest;
  readonly onCreated: (user: UserResponse) => void;
  readonly organizationId: string;
}

export function CreateUserForm({
  createUserRequest,
  onCreated,
  organizationId,
}: CreateUserFormProps) {
  const form = useForm({
    defaultValues: { displayName: "", email: "", organizationId } satisfies CreateUserInput,
    onSubmit: async ({ value }) => {
      const user = await createUserRequest(CREATE_USER_SCHEMA.parse(value));
      form.reset();
      onCreated(user);
    },
    validators: { onSubmit: CREATE_USER_SCHEMA },
  });

  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field name="displayName">
        {(field) => <UserField field={field} label="Display name" type="text" />}
      </form.Field>
      <form.Field name="email">
        {(field) => <UserField field={field} label="Email" type="email" />}
      </form.Field>
      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button disabled={!canSubmit || isSubmitting} type="submit">
            {isSubmitting ? "Creating…" : "Create user"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

function UserField({
  field,
  label,
  type,
}: {
  readonly field: {
    readonly name: string;
    readonly state: {
      readonly value: string;
      readonly meta: { readonly errors: readonly unknown[] };
    };
    readonly handleBlur: () => void;
    readonly handleChange: (value: string) => void;
  };
  readonly label: string;
  readonly type: "email" | "text";
}) {
  const message = getIssueMessage(field.state.meta.errors[0]);

  return (
    <div className="grid gap-2">
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        aria-describedby={`${field.name}-error`}
        aria-invalid={field.state.meta.errors.length > 0}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(event) => {
          field.handleChange(event.target.value);
        }}
        type={type}
        value={field.state.value}
      />
      {message === undefined ? null : (
        <p className="text-sm text-destructive" id={`${field.name}-error`} role="alert">
          {message}
        </p>
      )}
    </div>
  );
}

function getIssueMessage(error: unknown): string | undefined {
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    return typeof error.message === "string" ? error.message : undefined;
  }

  return undefined;
}
