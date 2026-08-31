import Link from "next/link";
import { exigerAdmin } from "@/lib/admin";
import ImportCsvQuestions from "@/components/ImportCsvQuestions";

export default async function ImportCSV() {
  await exigerAdmin();

  return (
    <main className="container page">
      <div className="nav">
        <div>
          <div className="logo">Importer un CSV</div>
          <small className="muted">Banque de questions Haiti Nursing Exam Prep</small>
        </div>
        <Link href="/admin">Retour à l’administration</Link>
      </div>

      <ImportCsvQuestions />
    </main>
  );
}
