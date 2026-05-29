import { create } from 'zustand';
import type { AppData, ApiSettings, GlobalSettings, PromptTemplate } from './schema';
import { StorageClient } from './client';
import { createDefaultAppData } from './defaults';

interface AppStore {
  data: AppData;
  loaded: boolean;

  load: () => Promise<void>;
  updateApi: (patch: Partial<ApiSettings>) => Promise<void>;
  updateSettings: (patch: Partial<GlobalSettings>) => Promise<void>;
  upsertTemplate: (template: PromptTemplate) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  replaceAll: (data: AppData) => Promise<void>;
}

const client = new StorageClient();

export const useAppStore = create<AppStore>((set, get) => ({
  data: createDefaultAppData(),
  loaded: false,

  async load() {
    const data = await client.loadAppData();
    set({ data, loaded: true });
  },

  async updateApi(patch) {
    const data = { ...get().data, api: { ...get().data.api, ...patch } };
    await client.saveAppData(data);
    set({ data });
  },

  async updateSettings(patch) {
    const data = { ...get().data, settings: { ...get().data.settings, ...patch } };
    await client.saveAppData(data);
    set({ data });
  },

  async upsertTemplate(template) {
    const templates = [...get().data.promptTemplates];
    const idx = templates.findIndex((t) => t.id === template.id);
    if (idx >= 0) templates[idx] = template;
    else templates.push(template);
    const data = { ...get().data, promptTemplates: templates };
    await client.saveAppData(data);
    set({ data });
  },

  async deleteTemplate(id) {
    const target = get().data.promptTemplates.find((t) => t.id === id);
    if (target?.isBuiltin) throw new Error('Cannot delete a built-in template');
    const templates = get().data.promptTemplates.filter((t) => t.id !== id);
    // repair api if it referenced the deleted template
    let api = get().data.api;
    if (api.promptTemplateId === id) {
      api = { ...api, promptTemplateId: 'builtin-general' };
    }
    const data = { ...get().data, promptTemplates: templates, api };
    await client.saveAppData(data);
    set({ data });
  },

  async replaceAll(data) {
    await client.saveAppData(data);
    set({ data });
  },
}));
