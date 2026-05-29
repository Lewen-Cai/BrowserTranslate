import type { AppData, ApiSettings, GlobalSettings, PromptTemplate } from './schema';
import { createDefaultAppData } from './defaults';
import { migrateAppData } from './migrations';

export const EXPORT_FORMAT = 'browsertranslate-settings' as const;
export const EXPORT_VERSION = 1 as const;

export interface ExportFile {
  format: typeof EXPORT_FORMAT;
  version: typeof EXPORT_VERSION;
  exportedAt: number;
  data: {
    api: ApiSettings;
    settings: GlobalSettings;
    promptTemplates: PromptTemplate[]; // user-created only
  };
}

/** Thrown when an imported file is not a recognizable settings export. */
export class ImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImportError';
  }
}

/**
 * Serialize the portable slice of AppData. Keys are stripped unless
 * opts.includeKeys. `exportedAt` is injected by the caller so this stays pure.
 */
export function exportAppData(
  data: AppData,
  opts: { includeKeys: boolean },
  exportedAt: number,
): ExportFile {
  const api: ApiSettings = { ...data.api };
  if (!opts.includeKeys) {
    api.apiKey = '';
    if (api.savedConfigs) {
      const stripped: NonNullable<ApiSettings['savedConfigs']> = {};
      for (const [slot, cfg] of Object.entries(api.savedConfigs)) {
        if (cfg) stripped[slot as keyof typeof stripped] = { ...cfg, apiKey: '' };
      }
      api.savedConfigs = stripped;
    }
  }
  return {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt,
    data: {
      api,
      settings: { ...data.settings },
      promptTemplates: data.promptTemplates.filter((t) => !t.isBuiltin),
    },
  };
}

/**
 * Validate a parsed export file and turn it into a full AppData (full replace).
 * Missing fields are filled from defaults; builtins are re-seeded and integrity
 * is repaired via the shared migrateAppData pass.
 */
export function importAppData(parsed: unknown): AppData {
  if (!parsed || typeof parsed !== 'object') {
    throw new ImportError('Not a valid settings file');
  }
  const file = parsed as Partial<ExportFile>;
  if (file.format !== EXPORT_FORMAT) {
    throw new ImportError('Unrecognized file format');
  }
  if (file.version !== EXPORT_VERSION) {
    throw new ImportError(`Unsupported file version: ${String(file.version)}`);
  }
  if (!file.data || typeof file.data !== 'object') {
    throw new ImportError('Settings file has no data');
  }

  const base = createDefaultAppData();
  const importedTemplates = Array.isArray(file.data.promptTemplates)
    ? file.data.promptTemplates.filter((t): t is PromptTemplate => !!t && t.isBuiltin === false)
    : [];

  const candidate: AppData = {
    version: base.version,
    api: { ...base.api, ...(file.data.api ?? {}) },
    settings: { ...base.settings, ...(file.data.settings ?? {}) },
    promptTemplates: [...base.promptTemplates, ...importedTemplates],
  };

  // Reuse the integrity-repair pass: re-seeds builtins, repairs orphaned refs,
  // fills provider defaults, seeds savedConfigs.
  return migrateAppData(candidate);
}
