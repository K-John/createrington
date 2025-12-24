import { Pool } from "pg";
import { BaseQueries } from "../base.queries";
import {
  WaitlistEntry,
  WaitlistEntryCreate,
  WaitlistEntryRow,
  WaitlistStatus,
} from "./types";

type Identifier =
  | { id: number }
  | { email: string }
  | { discordName: string }
  | { token: string }
  | { discordId: string };

type Filters = {
  submittedAt: Date;
  discordMessageId: string;
  status: WaitlistStatus;
  joinedDiscord: boolean;
  verified: boolean;
  registered: boolean;
  joinedMinecraft: boolean;
  acceptedAt: Date;
  acceptedBy: string;
};

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
