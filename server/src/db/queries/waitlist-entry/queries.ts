import { Pool } from "pg";
import { BaseQueries } from "../base.queries";
import { WaitlistEntry, WaitlistEntryCreate, WaitlistEntryRow } from "./types";

type Identifier =
  | { id: number }
  | { email: string }
  | { discordName: string }
  | { token: string };

type Filters = { submittedAt: Date };

export class WaitlistQueries extends BaseQueries<{
  DbEntity: WaitlistEntryRow;
  Entity: WaitlistEntry;
  Identifier: Identifier;
  Filters: Filters;
  Create: WaitlistEntryCreate;
  Update: Partial<WaitlistEntry>;
}> {
  protected readonly table = "waitlist_entry";

  constructor(db: Pool) {
    super(db);
  }
}
