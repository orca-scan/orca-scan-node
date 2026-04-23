// Type definitions for orca-scan-node
// Project: https://github.com/orca-scan/orca-scan-node
// Definitions by: Orca Scan <https://orcascan.com>

export interface OrcaScanOptions {
  endpoint?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface Sheet {
  _id: string;
  name: string;
  isOwner?: boolean;
  canAdmin?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  rows?: number;
}

export interface Row {
  [key: string]: any;
}

export interface Field {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  autofocus?: boolean;
  autoselect?: boolean;
  emptyOnEdit?: boolean;
  emptyOnScan?: boolean;
  hiddenMobile?: boolean;
  hiddenWeb?: boolean;
  readonlyWeb?: boolean;
  readonlyMobile?: boolean;
  useInMobileSearch?: boolean;
  useValueInList?: boolean;
}

export interface User {
  _id: string;
  email: string;
  owner?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  canAdmin?: boolean;
}

export interface Hook {
  _id: string;
  eventName: string;
  sheetId: string;
  targetUrl: string;
}

export interface SheetSettings {
  allowPublicExport?: boolean;
  publicExportUrl?: string;
  allowPublicEntry?: boolean;
  publicEntryUrl?: string;
  allowWebHookIn?: boolean;
  webHookInUrl?: string;
  lookupUrl?: string;
  validationUrl?: string;
  webHookOutUrl?: string;
  secret?: string;
}

export interface OrcaScan {
  endpoint: string;
  timeoutMs: number;
  maxRetries: number;
  defaultHeaders: Record<string, string>;
  settings: {
    get(sheetId: string): Promise<SheetSettings>;
    update(sheetId: string, settings: SheetSettings): Promise<SheetSettings>;
  };
  sheets: {
    list(): Promise<Sheet[]>;
    create(payload: { name: string; templateName?: string }): Promise<Sheet>;
    clear(sheetId: string): Promise<any>;
    rename(sheetId: string, payload: { name: string; description?: string }): Promise<any>;
    delete(sheetId: string): Promise<any>;
  };
  rows: {
    list(sheetId: string, options?: { withTitles?: boolean; withTitle?: boolean }): Promise<Row[]>;
    get(sheetId: string, rowId: string, options?: { withTitles?: boolean; withTitle?: boolean }): Promise<Row>;
    add(sheetId: string, data: Row | Row[], options?: { withTitles?: boolean; withTitle?: boolean; partial?: boolean }): Promise<Row | Row[]>;
    updateOne(sheetId: string, rowId: string, data: Row, options?: { withTitles?: boolean; withTitle?: boolean; partial?: boolean }): Promise<Row>;
    updateMany(sheetId: string, rows: Row[], options?: { withTitles?: boolean; withTitle?: boolean; partial?: boolean }): Promise<Row[]>;
    deleteOne(sheetId: string, rowId: string): Promise<any>;
    deleteMany(sheetId: string, rowIds: string[]): Promise<any>;
    count(sheetId: string): Promise<{ count: number }>;
  };
  fields: {
    list(sheetId: string): Promise<Field[]>;
    create(sheetId: string, payload: Partial<Field> & { label: string; format: string }): Promise<Field>;
    update(sheetId: string, fieldKey: string, payload: Partial<Field>): Promise<Field>;
    delete(sheetId: string, fieldKey: string): Promise<any>;
  };
  history: {
    sheet(sheetId: string): Promise<any[]>;
    row(sheetId: string, rowId: string): Promise<any[]>;
  };
  users: {
    list(sheetId: string): Promise<User[]>;
    add(sheetId: string, payload: { email: string; canUpdate?: boolean; canDelete?: boolean; canExport?: boolean; canAdmin?: boolean }): Promise<User>;
    update(sheetId: string, userId: string, payload: Partial<User>): Promise<User>;
    remove(sheetId: string, userId: string): Promise<any>;
  };
  hooks: {
    events(sheetId: string): Promise<string[]>;
    list(sheetId: string): Promise<Hook[]>;
    get(sheetId: string, hookId: string): Promise<Hook>;
    create(sheetId: string, payload: { eventName: string; targetUrl: string }): Promise<Hook>;
    update(sheetId: string, hookId: string, payload: Partial<Hook>): Promise<Hook>;
    delete(sheetId: string, hookId: string): Promise<any>;
  };
}

/**
 * Orca Scan node client
 * @param apiKey - your orca scan api key
 * @param options - optional configuration
 */
declare function OrcaScanNode(apiKey: string, options?: OrcaScanOptions): OrcaScan;

export = OrcaScanNode;
