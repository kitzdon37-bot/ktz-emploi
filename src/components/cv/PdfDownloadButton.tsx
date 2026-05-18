"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { CvData, CvTemplate } from "@/types/cv";
import ModernPdf from "./pdf/ModernPdf";
import ClassicPdf from "./pdf/ClassicPdf";
import CreativePdf from "./pdf/CreativePdf";
import { Download } from "lucide-react";

interface Props {
  data: CvData;
  template: CvTemplate;
}

function getDoc(data: CvData, template: CvTemplate) {
  if (template === "classic") return <ClassicPdf data={data} />;
  if (template === "creative") return <CreativePdf data={data} />;
  return <ModernPdf data={data} />;
}

export default function PdfDownloadButton({ data, template }: Props) {
  const filename = `CV_${data.firstName || "mon"}_${data.lastName || "cv"}.pdf`.replace(/\s+/g, "_");

  return (
    <PDFDownloadLink document={getDoc(data, template)} fileName={filename}>
      {({ loading }) => (
        <button
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          disabled={loading}
        >
          <Download className="h-4 w-4" />
          {loading ? "Génération..." : "Télécharger PDF"}
        </button>
      )}
    </PDFDownloadLink>
  );
}
