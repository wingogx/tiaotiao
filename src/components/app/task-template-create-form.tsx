'use client';

import { useState } from 'react';

import { createTaskTemplate } from '@/app/actions';
import type { Project, TaskTemplate } from '@/lib/data/queries';

import { Field, selectClassName } from '@/components/app/admin-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type TaskType = TaskTemplate['source_type'];

const taskTypes: Array<{ label: string; value: TaskType; description: string }> = [
  { label: '固定任务', value: 'fixed', description: '每天生成，可设置起止日期。' },
  { label: '项目每日任务', value: 'project_daily', description: '绑定项目，每天生成，可设置起止日期。' },
  { label: '指定日期任务', value: 'project_once', description: '只在某一天生成一次。' },
];

export function TaskTemplateCreateForm({ projects }: { projects: Project[] }) {
  const [sourceType, setSourceType] = useState<TaskType>('fixed');
  const usesRange = sourceType !== 'project_once';

  return (
    <form action={createTaskTemplate} className="space-y-4">
      <Field label="习惯名称"><Input name="title" placeholder="例如每天复盘 30 分钟" required /></Field>

      <div className="grid gap-2">
        <div className="text-xs font-bold text-[var(--neko-brown)]">任务类型</div>
        <div className="grid gap-2">
          {taskTypes.map((item) => (
            <label key={item.value} className={`cursor-pointer rounded-[22px] border px-4 py-3 transition ${sourceType === item.value ? 'border-[var(--neko-red)] bg-[#f7dfe4]' : 'border-[var(--neko-line)] bg-white/70 hover:bg-white'}`}>
              <input
                type="radio"
                name="sourceType"
                value={item.value}
                checked={sourceType === item.value}
                onChange={() => setSourceType(item.value)}
                className="sr-only"
              />
              <div className="text-sm font-black text-[var(--neko-ink)]">{item.label}</div>
              <div className="mt-1 text-xs leading-5 text-[var(--neko-muted)]">{item.description}</div>
            </label>
          ))}
        </div>
      </div>

      {sourceType !== 'fixed' ? (
        <Field label="绑定项目">
          <select name="projectId" className={selectClassName} required={sourceType === 'project_daily' || sourceType === 'project_once'}>
            <option value="">选择项目</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {usesRange ? (
        <div className="grid gap-3">
          <Field label="开始日期"><Input type="date" name="startDate" /></Field>
          <Field label="结束日期"><Input type="date" name="endDate" /></Field>
        </div>
      ) : (
        <Field label="指定日期"><Input type="date" name="scheduledDate" required /></Field>
      )}

      <Button fullWidth className="h-12 rounded-[20px] font-black">保存养成习惯</Button>
    </form>
  );
}
