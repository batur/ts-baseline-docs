export interface CreateUserInput {
  readonly displayName: string;
  readonly email: string;
  readonly organizationId: string;
}

export interface ListUsersInput {
  readonly cursor?: string;
  readonly limit: number;
  readonly organizationId: string;
}

export interface NewUserRecord extends CreateUserInput {
  readonly createdAt: Date;
  readonly id: string;
}

export interface User extends CreateUserInput {
  readonly createdAt: Date;
  readonly id: string;
}

export interface UserRepository {
  create(input: NewUserRecord): Promise<User>;
  findByEmail(organizationId: string, email: string): Promise<User | undefined>;
  list(input: ListUsersInput): Promise<readonly User[]>;
}

export interface UserResponse {
  readonly createdAt: string;
  readonly displayName: string;
  readonly id: string;
}
