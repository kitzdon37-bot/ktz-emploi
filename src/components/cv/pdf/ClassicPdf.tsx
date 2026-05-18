import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { CvData } from "@/types/cv";

const s = StyleSheet.create({
  page: { fontFamily: "Times-Roman", fontSize: 9, color: "#1f2937", padding: "40 48", backgroundColor: "#ffffff" },
  headerCenter: { alignItems: "center", borderBottom: "2 solid #111827", paddingBottom: 14, marginBottom: 14 },
  fullName: { fontSize: 20, fontFamily: "Times-Bold", textTransform: "uppercase", letterSpacing: 3 },
  jobTitle: { fontSize: 10, color: "#6b7280", fontFamily: "Times-Italic", marginTop: 3 },
  contactRow: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 16, marginTop: 6 },
  contact: { fontSize: 8, color: "#6b7280" },
  sectionTitle: { fontSize: 8, fontFamily: "Times-Bold", textTransform: "uppercase", letterSpacing: 2, color: "#111827", marginBottom: 3 },
  divider: { height: 1, backgroundColor: "#d1d5db", marginBottom: 8 },
  row: { flexDirection: "row", gap: 14, marginBottom: 6 },
  dateCol: { width: 64, textAlign: "right", flexShrink: 0 },
  date: { fontSize: 8, color: "#9ca3af", fontFamily: "Times-Italic" },
  bold: { fontFamily: "Times-Bold", fontSize: 9 },
  italic: { fontFamily: "Times-Italic", fontSize: 8, color: "#6b7280" },
  desc: { fontSize: 8, color: "#4b5563", lineHeight: 1.5, marginTop: 2 },
  section: { marginBottom: 14 },
  summary: { fontSize: 8, color: "#4b5563", lineHeight: 1.6 },
  inlineRow: { flexDirection: "row", gap: 24 },
  skillsText: { fontSize: 8, color: "#4b5563" },
});

function fmt(start: string, current: boolean, end: string) {
  if (!start) return "";
  const [y, m] = start.split("-");
  const months = ["Jan.", "Fév.", "Mar.", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sep.", "Oct.", "Nov.", "Déc."];
  const startStr = m ? `${months[parseInt(m) - 1]} ${y}` : y;
  if (current) return `${startStr}\n– Présent`;
  if (!end) return startStr;
  const [ey, em] = end.split("-");
  return `${startStr}\n– ${em ? `${months[parseInt(em) - 1]} ${ey}` : ey}`;
}

export default function ClassicPdf({ data }: { data: CvData }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.headerCenter}>
          <Text style={s.fullName}>{data.firstName} {data.lastName}</Text>
          {data.title ? <Text style={s.jobTitle}>{data.title}</Text> : null}
          <View style={s.contactRow}>
            {data.email ? <Text style={s.contact}>{data.email}</Text> : null}
            {data.phone ? <Text style={s.contact}>{data.phone}</Text> : null}
            {data.location ? <Text style={s.contact}>{data.location}</Text> : null}
            {data.linkedin ? <Text style={s.contact}>{data.linkedin}</Text> : null}
          </View>
        </View>

        {data.summary ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Profil Professionnel</Text>
            <View style={s.divider} />
            <Text style={s.summary}>{data.summary}</Text>
          </View>
        ) : null}

        {data.experiences.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Expériences Professionnelles</Text>
            <View style={s.divider} />
            {data.experiences.map((e) => (
              <View key={e.id} style={s.row}>
                <View style={s.dateCol}><Text style={s.date}>{fmt(e.startDate, e.current, e.endDate)}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.bold}>{e.position}</Text>
                  <Text style={s.italic}>{e.company}{e.location ? `, ${e.location}` : ""}</Text>
                  {e.description ? <Text style={s.desc}>{e.description}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        )}

        {data.education.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Formation</Text>
            <View style={s.divider} />
            {data.education.map((e) => (
              <View key={e.id} style={s.row}>
                <View style={s.dateCol}><Text style={s.date}>{fmt(e.startDate, e.current, e.endDate)}</Text></View>
                <View>
                  <Text style={s.bold}>{e.degree}{e.field ? ` en ${e.field}` : ""}</Text>
                  <Text style={s.italic}>{e.school}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={s.inlineRow}>
          {data.skills.length > 0 && (
            <View style={{ flex: 1 }}>
              <Text style={s.sectionTitle}>Compétences</Text>
              <View style={s.divider} />
              <Text style={s.skillsText}>{data.skills.map((sk) => sk.name).join("  ·  ")}</Text>
            </View>
          )}
          {data.languages.length > 0 && (
            <View style={{ flex: 1 }}>
              <Text style={s.sectionTitle}>Langues</Text>
              <View style={s.divider} />
              <Text style={s.skillsText}>{data.languages.map((l) => `${l.name} (${l.level})`).join("  ·  ")}</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}
