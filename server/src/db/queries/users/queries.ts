import { Pool } from "pg";
import { BaseQueries } from "../base.queries";
import { User, UserCreate, UserRow, UserUpdate } from "./types";

type Identifier =
  | { id: number }
  | { mcUuid: string }
  | { mcName: string }
  | { discordId: string };

export class UserQueries extends BaseQueries<{
  Entity: User;
  DbEntity: UserRow;
  Identifier: Identifier;
  Filters: Partial<User>;
  Update: UserUpdate;
}> {
  protected readonly table = "users";

  constructor(db: Pool) {
    super(db);
  }
}
