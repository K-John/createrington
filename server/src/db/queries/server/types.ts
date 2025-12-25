import { CamelCaseKeys } from "@/types";

export interface ServerRow {
  id: number;
  name: string;
  identifier: string;
  created_at: Date;
}

export type Server = CamelCaseKeys<ServerRow>;

export interface ServerCreate {
  name: string;
  identifier: string;
}
