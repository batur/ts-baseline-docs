export interface CreateUserInput {
  readonly displayName: string;
  readonly email: string;
  readonly organizationId: string;
}

export interface UserResponse {
  readonly createdAt: string;
  readonly displayName: string;
  readonly id: string;
}

export interface ListUsersInput {
  readonly limit: number;
  readonly organizationId: string;
}
