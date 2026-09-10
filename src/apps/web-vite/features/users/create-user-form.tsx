import { useForm } from "@tanstack/react-form";

import { Button, Input, Label } from "../../shared/ui";

import { createUser } from "./user.api";
import { CREATE_USER_SCHEMA } from "./user.schema";

import type { CreateUserInput, UserResponse } from "./user.types";

export type CreateUserRequest = (input: CreateUserInput) => Promise<UserResponse>;

interface CreateUserFormProps {
  readonly createUserRequest?: CreateUserRequest;
  readonly onCreated: (user: UserResponse) => void;
  readonly organizationId: string;
}

export function CreateUserForm({
  createUserRequest = createUser,
  onCreated,
  organizationId,
}: CreateUserFormProps) {
  const form = useForm({
    defaultValues: {
      displayName: "",
      email: "",
      organizationId,
    } satisfies CreateUserInput,
    onSubmit: async ({ value }) => {
      const user = await createUserRequest(CREATE_USER_SCHEMA.parse(value));
      form.reset();
      onCreated(user);
    },
    validators: {
      onSubmit: CREATE_USER_SCHEMA,
    },
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
        {(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name}>Display name</Label>
            <Input
              aria-describedby={`${field.name}-error`}
              aria-invalid={field.state.meta.errors.length > 0}
              id={field.name}
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(event) => {
                field.handleChange(event.target.value);
              }}
              value={field.state.value}
            />
            <FieldError id={`${field.name}-error`} errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>
      <form.Field name="email">
        {(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name}>Email</Label>
            <Input
              aria-describedby={`${field.name}-error`}
              aria-invalid={field.state.meta.errors.length > 0}
              id={field.name}
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(event) => {
                field.handleChange(event.target.value);
              }}
              type="email"
              value={field.state.value}
            />
            <FieldError id={`${field.name}-error`} errors={field.state.meta.errors} />
          </div>
        )}
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

function FieldError({ errors, id }: { readonly errors: readonly unknown[]; readonly id: string }) {
  const message = getIssueMessage(errors[0]);

  return message === undefined ? null : (
    <p className="text-sm text-destructive" id={id} role="alert">
      {message}
    </p>
  );
}

function getIssueMessage(error: unknown): string | undefined {
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    return typeof error.message === "string" ? error.message : undefined;
  }

  return undefined;
}
