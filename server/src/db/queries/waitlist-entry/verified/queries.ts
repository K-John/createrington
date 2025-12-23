import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import {
  WaitlistEntryVerified,
  WaitlistEntryVerifiedCreate,
  WaitlistEntryVerifiedRow,
} from "./types";

type Identifier = { discordId: string };

type Filters = { verifiedAt: Date };

export class WaitlistEntryVerifiedQueries extends BaseQueries<{
  DbEntity: WaitlistEntryVerified;
  Entity: WaitlistEntryVerifiedRow;
  Identifier: Identifier;
  Filters: Filters;
  Create: WaitlistEntryVerifiedCreate;
  Update: Partial<WaitlistEntryVerified>;
}> {
  protected readonly table = "waitlist_entry_verified";

  constructor(db: Pool) {
    super(db);
  }
}
