"use client";

import { Download } from "lucide-react";

export default function ExportCsvButton() {
  return (
    <a
      href="/api/employer/applications/export"
      download
      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors"
    >
      <Download className="h-4 w-4" />
      Exporter CSV
    </a>
  );
}
