import { BaseQueries } from "@/db/queries/base.queries";
import {
  AdminLogAction,
  AdminLogActionCreate,
  AdminLogActionRow,
  AdminLogActionType,
} from "./types";
import { Pool } from "pg";

type Identifier = { id: number };

type Filters = {
  adminDiscordId: string;
  targetPlayerUuid: string;
  actionType: AdminLogActionType;
  tableName: string;
  performedAt: Date;
};

export class AdminLogActionQueries extends BaseQueries<{
  DbEntity: AdminLogActionRow;
  Entity: AdminLogAction;
  Identifier: Identifier;
  Filters: Filters;
  Update: never;
  Create: AdminLogActionCreate;
}> {
  protected readonly table = "admin_log_action";

  constructor(db: Pool) {
    super(db);
  }
}
