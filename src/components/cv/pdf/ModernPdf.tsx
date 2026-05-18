import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { CvData } from "@/types/cv";

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
  divider: { height: 1, backgroundColor: "#f3f4f6", marginVertical: 8 },
});

function fmt(s: string, current: boolean, end: string) {
  if (!s) return "";
  const [y, m] = s.split("-");
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
  const startStr = m ? `${months[parseInt(m) - 1]} ${y}` : y;
  if (current) return `${startStr} – Présent`;
  if (!end) return startStr;
  const [ey, em] = end.split("-");
  return `${startStr} – ${em ? `${months[parseInt(em) - 1]} ${ey}` : ey}`;
}

export default function ModernPdf({ data }: { data: CvData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>
            {data.firstName} <Text style={styles.nameAccent}>{data.lastName.toUpperCase()}</Text>
          </Text>
          {data.title ? <Text style={styles.jobTitle}>{data.title}</Text> : null}
          <View style={styles.contactRow}>
            {data.email ? <Text style={styles.contactItem}>{data.email}</Text> : null}
            {data.phone ? <Text style={styles.contactItem}>{data.phone}</Text> : null}
            {data.location ? <Text style={styles.contactItem}>{data.location}</Text> : null}
            {data.linkedin ? <Text style={styles.contactItem}>{data.linkedin}</Text> : null}
          </View>
        </View>

        <View style={styles.body}>
          {/* Sidebar */}
          <View style={styles.sidebar}>
            {data.skills.length > 0 && (
              <View style={{ marginBottom: 14 }}>
                <Text style={styles.sectionTitle}>Compétences</Text>
                {data.skills.map((s) => (
                  <View key={s.id} style={styles.skillRow}>
                    <Text style={styles.skillName}>{s.name}</Text>
                    <View style={styles.skillBarBg}>
                      <View style={[styles.skillBarFill, { width: `${(s.level / 5) * 100}%` }]} />
                    </View>
                  </View>
                ))}
              </View>
            )}
            {data.languages.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Langues</Text>
                {data.languages.map((l) => (
                  <View key={l.id} style={styles.langRow}>
                    <Text style={styles.langName}>{l.name}</Text>
                    <Text style={styles.langLevel}>{l.level}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Main */}
          <View style={styles.main}>
            {data.summary ? (
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.sectionTitle}>Profil</Text>
                <Text style={styles.summary}>{data.summary}</Text>
              </View>
            ) : null}
            {data.experiences.length > 0 && (
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.sectionTitle}>Expériences</Text>
                {data.experiences.map((e) => (
                  <View key={e.id} style={styles.expItem}>
                    <View style={styles.expHeader}>
                      <View>
                        <Text style={styles.expPosition}>{e.position}</Text>
                        <Text style={styles.expCompany}>{e.company}{e.location ? ` · ${e.location}` : ""}</Text>
                      </View>
                      <Text style={styles.expDate}>{fmt(e.startDate, e.current, e.endDate)}</Text>
                    </View>
                    {e.description ? <Text style={styles.expDesc}>{e.description}</Text> : null}
                  </View>
                ))}
              </View>
            )}
            {data.education.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Formation</Text>
                {data.education.map((e) => (
                  <View key={e.id} style={styles.eduItem}>
                    <View style={styles.expHeader}>
                      <View>
                        <Text style={styles.eduDegree}>{e.degree}{e.field ? ` — ${e.field}` : ""}</Text>
                        <Text style={styles.eduSchool}>{e.school}</Text>
                      </View>
                      <Text style={styles.expDate}>{fmt(e.startDate, e.current, e.endDate)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
