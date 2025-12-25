import { Pool } from "pg";
import { BaseQueries } from "../base.queries";
import { Server, ServerCreate, ServerRow } from "./types";

type Identifier = { id: number } | { identifier: string } | { name: string };

type Filters = {
  createdAt: Date;
};

export class ServerQueries extends BaseQueries<{
  DbEntity: ServerRow;
  Entity: Server;
  Identifier: Identifier;
  Filters: Filters;
  Update: Partial<Server>;
  Create: ServerCreate;
}> {
  protected readonly table = "server";

  constructor(db: Pool) {
    super(db);
  }
}
