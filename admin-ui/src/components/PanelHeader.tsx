"use client";

import { useTranslations } from "next-intl";

interface PanelHeaderProps {
  titleKey: string;
}

export default function PanelHeader({ titleKey }: PanelHeaderProps) {
  const t = useTranslations();

  return (
    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
        {t(titleKey)}
      </h2>
    </div>
  );
}
