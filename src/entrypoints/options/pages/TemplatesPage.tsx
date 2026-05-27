import { useState } from 'preact/hooks';
import { useAppStore } from '~/storage/store';
import { Button } from '~/ui/components/Button';
import { Input } from '~/ui/components/Input';
import { TextArea } from '~/ui/components/TextArea';
import { SectionHeader } from '~/ui/components/SectionHeader';
import { Plus, Edit3, Trash2, Check, Copy } from '~/ui/icons';
import { useT } from '~/i18n';
import type { PromptTemplate } from '~/storage/schema';

function emptyTemplate(): PromptTemplate {
  return {
    id: crypto.randomUUID(),
    name: 'New Template',
    isBuiltin: false,
    systemPrompt: 'You are a professional translator. Translate accurately and naturally. Output ONLY the translation.',
    userPromptTemplate: 'Translate the following text to {{targetLang}}:\n\n{{text}}',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function TemplatesPage() {
  const templates = useAppStore((s) => s.data.promptTemplates);
  const upsert = useAppStore((s) => s.upsertTemplate);
  const remove = useAppStore((s) => s.deleteTemplate);
  const [editing, setEditing] = useState<PromptTemplate | null>(null);
  const t = useT();

  async function save() {
    if (!editing) return;
    if (!editing.userPromptTemplate.includes('{{text}}')) {
      alert('User prompt template must contain {{text}}');
      return;
    }
    await upsert({ ...editing, updatedAt: Date.now() });
    setEditing(null);
  }

  function clone(tmpl: PromptTemplate) {
    setEditing({ ...tmpl, id: crypto.randomUUID(), name: tmpl.name + ' (copy)', isBuiltin: false, createdAt: Date.now(), updatedAt: Date.now() });
  }

  async function del(id: string) {
    if (!confirm('Delete this template?')) return;
    await remove(id);
  }

  if (editing) {
    return (
      <div class="max-w-lg">
        <SectionHeader number="—" label={editing.isBuiltin ? t('viewReadonly').toUpperCase() : t('editTemplate').toUpperCase()} />
        <div class="space-y-4">
          <Input label="Name" value={editing.name} disabled={editing.isBuiltin}
            onInput={(e) => setEditing({ ...editing, name: (e.target as HTMLInputElement).value })}
          />
          <TextArea label={t('systemPrompt')} rows={5}
            value={editing.systemPrompt} disabled={editing.isBuiltin}
            onInput={(e) => setEditing({ ...editing, systemPrompt: (e.target as HTMLTextAreaElement).value })}
          />
          <TextArea label={t('userPromptTemplate')} rows={5}
            value={editing.userPromptTemplate} disabled={editing.isBuiltin}
            hint={t('userPromptTemplateHint')}
            onInput={(e) => setEditing({ ...editing, userPromptTemplate: (e.target as HTMLTextAreaElement).value })}
          />
          <div class="flex gap-2 pt-2">
            {!editing.isBuiltin && <Button onClick={save}><Check size={14} /> {t('save')}</Button>}
            <Button variant="secondary" onClick={() => setEditing(null)}>{editing.isBuiltin ? t('close') : t('cancel')}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class="max-w-2xl">
      <div class="flex items-center justify-between mb-4">
        <SectionHeader number="01" label={t('sectionPromptTemplates').toUpperCase()} />
      </div>
      <div class="mb-4">
        <Button onClick={() => setEditing(emptyTemplate())}><Plus size={14} /> {t('newTemplate')}</Button>
      </div>
      <ul class="border-t border-ap-border">
        {templates.map((tmpl) => (
          <li key={tmpl.id} class="border-b border-ap-border py-3 px-1 flex items-center gap-3 group hover:bg-ap-surface transition-colors">
            <span class="font-mono text-2xs text-ap-subtle tracking-wider w-6">{String(templates.indexOf(tmpl) + 1).padStart(2, '0')}</span>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium flex items-center gap-2">
                {tmpl.name}
                {tmpl.isBuiltin && (
                  <span class="font-mono text-2xs uppercase tracking-wider text-ap-subtle">{t('builtin')}</span>
                )}
              </div>
              <div class="text-2xs text-ap-muted font-mono truncate mt-0.5">{tmpl.systemPrompt.slice(0, 80)}…</div>
            </div>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" onClick={() => clone(tmpl)} title={t('clone')}><Copy size={12} /></Button>
              <Button variant="ghost" size="sm" onClick={() => setEditing(tmpl)} title={t('edit')}><Edit3 size={12} /></Button>
              {!tmpl.isBuiltin && <Button variant="ghost" size="sm" onClick={() => del(tmpl.id)} title={t('delete')}><Trash2 size={12} /></Button>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
