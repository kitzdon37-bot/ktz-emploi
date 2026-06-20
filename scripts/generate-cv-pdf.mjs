import { renderToFile } from "@react-pdf/renderer";
import { createElement } from "react";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Import the PDF component
const { default: ModernPdf } = await import("../src/components/cv/pdf/ModernPdf.tsx");

const cvData = {
  firstName: "Serge",
  lastName: "KPATA",
  title: "Comptable Senior",
  email: "serge.kpata@gmail.com",
  phone: "+236 72 85 34 17",
  location: "Bangui, République Centrafricaine",
  website: "",
  linkedin: "linkedin.com/in/serge-kpata",
  summary: "Comptable Senior avec 8 ans d'expérience dans les secteurs des télécommunications et des services financiers en Afrique centrale. Expert en normes OHADA, SAP FI/CO et contrôle de gestion. Capacité avérée à piloter la clôture des comptes, gérer les audits externes et assurer la conformité fiscale dans des environnements multi-devises.",
  experiences: [
    {
      id: "1",
      position: "Comptable Senior",
      company: "MTN Centrafrique",
      location: "Bangui",
      startDate: "2020-03",
      endDate: "",
      current: true,
      description: "Supervision de la comptabilité générale et analytique sous normes OHADA. Élaboration des états financiers mensuels et annuels (bilan, compte de résultat, flux de trésorerie). Coordination des audits externes (Deloitte). Gestion de la fiscalité : TVA, IS, IRPP, droits d'accise télécoms. Administration du module SAP FI/CO.",
    },
    {
      id: "2",
      position: "Comptable Confirmé",
      company: "Ecobank RCA",
      location: "Bangui",
      startDate: "2017-06",
      endDate: "2020-02",
      current: false,
      description: "Tenue des journaux comptables (achats, ventes, banque, caisse). Rapprochements bancaires quotidiens et gestion de la trésorerie. Déclarations fiscales mensuelles auprès de la DGI. Préparation des rapports financiers pour le siège régional (Lomé). Encadrement de 3 comptables juniors.",
    },
    {
      id: "3",
      position: "Assistant Comptable",
      company: "Cabinet Révision & Audit RCA",
      location: "Bangui",
      startDate: "2015-09",
      endDate: "2017-05",
      current: false,
      description: "Saisie comptable et lettrage des comptes tiers. Participation aux missions d'audit légal et contractuel. Établissement des déclarations fiscales (TVA, patente). Support à l'élaboration des bilans de fin d'exercice.",
    },
  ],
  education: [
    {
      id: "e1",
      degree: "Master CCA (Comptabilité, Contrôle, Audit)",
      field: "Comptabilité & Finance",
      school: "Université de Yaoundé II — ESSEC",
      startDate: "2013-09",
      endDate: "2015-06",
      current: false,
    },
    {
      id: "e2",
      degree: "Licence en Sciences de Gestion",
      field: "Finance & Comptabilité",
      school: "Université de Bangui — FSEG",
      startDate: "2010-09",
      endDate: "2013-06",
      current: false,
    },
  ],
  skills: [
    { id: "s1", name: "Comptabilité OHADA / SYSCOHADA", level: 5 },
    { id: "s2", name: "SAP FI/CO", level: 4 },
    { id: "s3", name: "États financiers & clôtures", level: 5 },
    { id: "s4", name: "Fiscalité centrafricaine", level: 5 },
    { id: "s5", name: "Contrôle de gestion", level: 4 },
    { id: "s6", name: "Microsoft Excel avancé", level: 5 },
    { id: "s7", name: "Gestion de trésorerie", level: 4 },
    { id: "s8", name: "Audit interne & externe", level: 4 },
  ],
  languages: [
    { id: "l1", name: "Français", level: "Bilingue" },
    { id: "l2", name: "Anglais", level: "Courant" },
    { id: "l3", name: "Sango", level: "Natif" },
  ],
  interests: ["Finance d'entreprise", "Transformation digitale comptable", "Mentorat"],
};

const outputPath = path.join(__dirname, "..", "CV_Serge_KPATA_ComptableSenior_Orange.pdf");

await renderToFile(createElement(ModernPdf, { data: cvData }), outputPath);
console.log("PDF généré :", outputPath);
