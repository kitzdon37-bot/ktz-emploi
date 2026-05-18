import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { CvData } from "@/types/cv";

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, flexDirection: "row", backgroundColor: "#ffffff" },
  sidebar: { width: 148, backgroundColor: "#0f766e", padding: "24 14", color: "white" },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#14b8a6", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  avatarText: { color: "white", fontSize: 18, fontFamily: "Helvetica-Bold" },
  sidebarName: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "white", lineHeight: 1.3 },
  sidebarNameAccent: { color: "#99f6e4" },
  sidebarTitle: { fontSize: 8, color: "#99f6e4", marginTop: 3, marginBottom: 12 },
  sidebarContact: { fontSize: 7.5, color: "#ccfbf1", marginBottom: 3 },
  sidebarSectionTitle: { fontSize: 7, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1.5, color: "#99f6e4", marginBottom: 5, marginTop: 12 },
  skillName: { fontSize: 8, color: "white", marginBottom: 2 },
  skillBarBg: { height: 2.5, backgroundColor: "#134e4a", borderRadius: 2, marginBottom: 5 },
  skillBarFill: { height: 2.5, backgroundColor: "#5eead4", borderRadius: 2 },
  langName: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "white" },
  langLevel: { fontSize: 7, color: "#99f6e4", marginBottom: 4 },
  main: { flex: 1, padding: "20 20" },
  sectionTitle: { fontSize: 7.5, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1.5, color: "#0d9488", borderBottom: "1 solid #ccfbf1", paddingBottom: 3, marginBottom: 8 },
  summary: { fontSize: 8, color: "#6b7280", lineHeight: 1.6, marginBottom: 12 },
  expItem: { marginBottom: 8, paddingLeft: 8, borderLeft: "2 solid #ccfbf1" },
  expRow: { flexDirection: "row", justifyContent: "space-between" },
  expPosition: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#111827" },
  expCompany: { fontSize: 8, color: "#0d9488" },
  expDate: { fontSize: 7, color: "#0d9488" },
  expDesc: { fontSize: 7.5, color: "#6b7280", lineHeight: 1.5, marginTop: 2 },
  section: { marginBottom: 12 },
});

function fmt(start: string, current: boolean, end: string) {
  if (!start) return "";
  const [y, m] = start.split("-");
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const s = m ? `${months[parseInt(m) - 1]} ${y}` : y;
  if (current) return `${s} – Présent`;
  if (!end) return s;
  const [ey, em] = end.split("-");
  return `${s} – ${em ? `${months[parseInt(em) - 1]} ${ey}` : ey}`;
}

export default function CreativePdf({ data }: { data: CvData }) {
  const initials = `${data.firstName?.[0] ?? "?"}${data.lastName?.[0] ?? ""}`;
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Sidebar */}
        <View style={s.sidebar}>
          <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
          <Text style={s.sidebarName}>
            {data.firstName}{"\n"}<Text style={s.sidebarNameAccent}>{data.lastName.toUpperCase()}</Text>
          </Text>
          {data.title ? <Text style={s.sidebarTitle}>{data.title}</Text> : null}

          {data.email ? <Text style={s.sidebarContact}>{data.email}</Text> : null}
          {data.phone ? <Text style={s.sidebarContact}>{data.phone}</Text> : null}
          {data.location ? <Text style={s.sidebarContact}>{data.location}</Text> : null}
          {data.linkedin ? <Text style={s.sidebarContact}>{data.linkedin}</Text> : null}

          {data.skills.length > 0 && (
            <View>
              <Text style={s.sidebarSectionTitle}>Compétences</Text>
              {data.skills.map((sk) => (
                <View key={sk.id}>
                  <Text style={s.skillName}>{sk.name}</Text>
                  <View style={s.skillBarBg}>
                    <View style={[s.skillBarFill, { width: `${(sk.level / 5) * 100}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          )}

          {data.languages.length > 0 && (
            <View>
              <Text style={s.sidebarSectionTitle}>Langues</Text>
              {data.languages.map((l) => (
                <View key={l.id}>
                  <Text style={s.langName}>{l.name}</Text>
                  <Text style={s.langLevel}>{l.level}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Main */}
        <View style={s.main}>
          {data.summary ? (
            <View style={s.section}>
              <Text style={s.sectionTitle}>À propos</Text>
              <Text style={s.summary}>{data.summary}</Text>
            </View>
          ) : null}
          {data.experiences.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Expériences</Text>
              {data.experiences.map((e) => (
                <View key={e.id} style={s.expItem}>
                  <View style={s.expRow}>
                    <Text style={s.expPosition}>{e.position}</Text>
                    <Text style={s.expDate}>{fmt(e.startDate, e.current, e.endDate)}</Text>
                  </View>
                  <Text style={s.expCompany}>{e.company}{e.location ? ` · ${e.location}` : ""}</Text>
                  {e.description ? <Text style={s.expDesc}>{e.description}</Text> : null}
                </View>
              ))}
            </View>
          )}
          {data.education.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Formation</Text>
              {data.education.map((e) => (
                <View key={e.id} style={s.expItem}>
                  <View style={s.expRow}>
                    <Text style={s.expPosition}>{e.degree}{e.field ? ` — ${e.field}` : ""}</Text>
                    <Text style={s.expDate}>{fmt(e.startDate, e.current, e.endDate)}</Text>
                  </View>
                  <Text style={s.expCompany}>{e.school}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}
