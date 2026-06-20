import { renderToFile } from "@react-pdf/renderer";
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: "#374151", backgroundColor: "#ffffff" },
  header: { backgroundColor: "#111827", padding: "24 32", color: "white" },
  name: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "white" },
  nameAccent: { color: "#fb923c" },
  jobTitle: { fontSize: 11, color: "#fdba74", marginTop: 4 },
  contactRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 12 },
  contactItem: { fontSize: 8, color: "#d1d5db" },
  body: { flexDirection: "row", flex: 1 },
  sidebar: { width: 140, backgroundColor: "#f9fafb", padding: "16 14", borderRight: "1 solid #e5e7eb" },
  main: { flex: 1, padding: "16 20" },
  sectionTitle: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#f97316", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 },
  skillRow: { marginBottom: 5 },
  skillName: { fontSize: 8, color: "#374151", marginBottom: 2 },
  skillBarBg: { height: 3, backgroundColor: "#e5e7eb", borderRadius: 2 },
  skillBarFill: { height: 3, backgroundColor: "#fb923c", borderRadius: 2 },
  langRow: { marginBottom: 4 },
  langName: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#374151" },
  langLevel: { fontSize: 7, color: "#9ca3af" },
  summary: { fontSize: 8, color: "#6b7280", lineHeight: 1.6, marginBottom: 12 },
  expItem: { marginBottom: 8 },
  expHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  expPosition: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#111827" },
  expCompany: { fontSize: 8, color: "#f97316" },
  expDate: { fontSize: 7, color: "#9ca3af" },
  expDesc: { fontSize: 8, color: "#6b7280", lineHeight: 1.5, marginTop: 2 },
  eduItem: { marginBottom: 6 },
  eduDegree: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#111827" },
  eduSchool: { fontSize: 8, color: "#f97316" },
});

function fmt(s, current, end) {
  if (!s) return "";
  const [y, m] = s.split("-");
  const months = ["Jan","Fev","Mar","Avr","Mai","Juin","Juil","Aout","Sep","Oct","Nov","Dec"];
  const startStr = m ? months[parseInt(m)-1] + " " + y : y;
  if (current) return startStr + " - Present";
  if (!end) return startStr;
  const [ey, em] = end.split("-");
  return startStr + " - " + (em ? months[parseInt(em)-1] + " " + ey : ey);
}

const data = {
  firstName: "Serge",
  lastName: "KPATA",
  title: "Comptable Senior",
  email: "serge.kpata@gmail.com",
  phone: "+236 72 85 34 17",
  location: "Bangui, Republique Centrafricaine",
  linkedin: "linkedin.com/in/serge-kpata",
  summary: "Comptable Senior avec 8 ans d experience dans les secteurs des telecommunications et des services financiers en Afrique centrale. Expert en normes OHADA, SAP FI/CO et controle de gestion. Capacite avered a piloter la cloture des comptes, gerer les audits externes et assurer la conformite fiscale.",
  experiences: [
    { id:"1", position:"Comptable Senior", company:"MTN Centrafrique", location:"Bangui", startDate:"2020-03", endDate:"", current:true, description:"Supervision de la comptabilite generale et analytique sous normes OHADA. Elaboration des etats financiers mensuels et annuels. Coordination des audits externes (Deloitte). Gestion de la fiscalite : TVA, IS, IRPP, droits d accise telecoms. Administration du module SAP FI/CO." },
    { id:"2", position:"Comptable Confirme", company:"Ecobank RCA", location:"Bangui", startDate:"2017-06", endDate:"2020-02", current:false, description:"Tenue des journaux comptables. Rapprochements bancaires et gestion de la tresorerie. Declarations fiscales mensuelles aupres de la DGI. Rapports financiers pour le siege regional (Lome). Encadrement de 3 comptables juniors." },
    { id:"3", position:"Assistant Comptable", company:"Cabinet Revision & Audit RCA", location:"Bangui", startDate:"2015-09", endDate:"2017-05", current:false, description:"Saisie comptable et lettrage des comptes tiers. Participation aux missions d audit legal. Declarations fiscales (TVA, patente). Support a l elaboration des bilans de fin d exercice." },
  ],
  education: [
    { id:"e1", degree:"Master CCA - Comptabilite, Controle, Audit", field:"Finance", school:"Universite de Yaounde II - ESSEC", startDate:"2013-09", endDate:"2015-06", current:false },
    { id:"e2", degree:"Licence en Sciences de Gestion", field:"Finance & Comptabilite", school:"Universite de Bangui - FSEG", startDate:"2010-09", endDate:"2013-06", current:false },
  ],
  skills: [
    { id:"s1", name:"Comptabilite OHADA / SYSCOHADA", level:5 },
    { id:"s2", name:"SAP FI/CO", level:4 },
    { id:"s3", name:"Etats financiers & clotures", level:5 },
    { id:"s4", name:"Fiscalite centrafricaine", level:5 },
    { id:"s5", name:"Controle de gestion", level:4 },
    { id:"s6", name:"Microsoft Excel avance", level:5 },
    { id:"s7", name:"Gestion de tresorerie", level:4 },
    { id:"s8", name:"Audit interne & externe", level:4 },
  ],
  languages: [
    { id:"l1", name:"Francais", level:"Bilingue" },
    { id:"l2", name:"Anglais", level:"Courant" },
    { id:"l3", name:"Sango", level:"Natif" },
  ],
};

const e = React.createElement;

const doc = e(Document, null,
  e(Page, { size: "A4", style: styles.page },
    e(View, { style: styles.header },
      e(Text, { style: styles.name },
        data.firstName + " ",
        e(Text, { style: styles.nameAccent }, data.lastName)
      ),
      e(Text, { style: styles.jobTitle }, data.title),
      e(View, { style: styles.contactRow },
        e(Text, { style: styles.contactItem }, data.email),
        e(Text, { style: styles.contactItem }, data.phone),
        e(Text, { style: styles.contactItem }, data.location),
        e(Text, { style: styles.contactItem }, data.linkedin),
      )
    ),
    e(View, { style: styles.body },
      e(View, { style: styles.sidebar },
        e(View, { style: { marginBottom: 14 } },
          e(Text, { style: styles.sectionTitle }, "Competences"),
          ...data.skills.map(s =>
            e(View, { key: s.id, style: styles.skillRow },
              e(Text, { style: styles.skillName }, s.name),
              e(View, { style: styles.skillBarBg },
                e(View, { style: [styles.skillBarFill, { width: ((s.level/5)*100) + "%" }] })
              )
            )
          )
        ),
        e(View, null,
          e(Text, { style: styles.sectionTitle }, "Langues"),
          ...data.languages.map(l =>
            e(View, { key: l.id, style: styles.langRow },
              e(Text, { style: styles.langName }, l.name),
              e(Text, { style: styles.langLevel }, l.level),
            )
          )
        )
      ),
      e(View, { style: styles.main },
        e(View, { style: { marginBottom: 10 } },
          e(Text, { style: styles.sectionTitle }, "Profil"),
          e(Text, { style: styles.summary }, data.summary),
        ),
        e(View, { style: { marginBottom: 10 } },
          e(Text, { style: styles.sectionTitle }, "Experiences"),
          ...data.experiences.map(exp =>
            e(View, { key: exp.id, style: styles.expItem },
              e(View, { style: styles.expHeader },
                e(View, null,
                  e(Text, { style: styles.expPosition }, exp.position),
                  e(Text, { style: styles.expCompany }, exp.company + (exp.location ? " · " + exp.location : "")),
                ),
                e(Text, { style: styles.expDate }, fmt(exp.startDate, exp.current, exp.endDate)),
              ),
              e(Text, { style: styles.expDesc }, exp.description),
            )
          )
        ),
        e(View, null,
          e(Text, { style: styles.sectionTitle }, "Formation"),
          ...data.education.map(edu =>
            e(View, { key: edu.id, style: styles.eduItem },
              e(View, { style: styles.expHeader },
                e(View, null,
                  e(Text, { style: styles.eduDegree }, edu.degree),
                  e(Text, { style: styles.eduSchool }, edu.school),
                ),
                e(Text, { style: styles.expDate }, fmt(edu.startDate, edu.current, edu.endDate)),
              )
            )
          )
        )
      )
    )
  )
);

const out = path.join(__dirname, "..", "CV_Serge_KPATA_ComptableSenior_Orange.pdf");
await renderToFile(doc, out);
console.log("PDF genere :", out);
