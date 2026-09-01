export const metadata = {
  title: "Suppression du compte et des données | Haiti Nursing Exam Prep",
  description:
    "Procédure pour demander la suppression d’un compte Haiti Nursing Exam Prep et des données associées.",
};

export default function SuppressionComptePage() {
  const email = "docjouvens12@gmail.com";
  const subject = encodeURIComponent(
    "Demande de suppression de compte - Haiti Nursing Exam Prep"
  );
  const body = encodeURIComponent(
    "Bonjour,\n\nJe souhaite demander la suppression de mon compte Haiti Nursing Exam Prep et des données associées.\n\nAdresse e-mail utilisée pour mon compte : \n\nMerci."
  );

  return (
    <main
      style={{
        maxWidth: 820,
        margin: "0 auto",
        padding: "40px 20px 80px",
        lineHeight: 1.7,
      }}
    >
      <h1>Suppression du compte et des données</h1>
      <p>
        <strong>Dernière mise à jour : 1 septembre 2026</strong>
      </p>

      <p>
        Cette page explique comment demander la suppression d’un compte
        <strong> Haiti Nursing Exam Prep</strong> et des données personnelles qui
        lui sont associées.
      </p>

      <h2>Comment demander la suppression</h2>
      <p>
        Envoyez une demande depuis l’adresse e-mail associée à votre compte en
        utilisant le bouton ci-dessous. Indiquez clairement que vous souhaitez
        supprimer votre compte Haiti Nursing Exam Prep.
      </p>

      <p>
        <a
          href={`mailto:${email}?subject=${subject}&body=${body}`}
          style={{
            display: "inline-block",
            padding: "12px 18px",
            borderRadius: 8,
            background: "#0b3a82",
            color: "white",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Demander la suppression de mon compte
        </a>
      </p>

      <p>
        Vous pouvez également envoyer directement un e-mail à :{" "}
        <a href={`mailto:${email}`}>{email}</a>.
      </p>

      <h2>Données supprimées</h2>
      <p>
        Lorsque la demande est vérifiée et traitée, le compte utilisateur et
        les données directement associées au fonctionnement de Haiti Nursing
        Exam Prep sont supprimés, notamment les informations de profil et, le
        cas échéant, les données d’apprentissage associées au compte telles que
        la progression, les résultats, les favoris et l’historique des réponses.
      </p>

      <h2>Données pouvant être conservées</h2>
      <p>
        Certaines informations strictement nécessaires peuvent être conservées
        lorsqu’une obligation légale, de sécurité ou de prévention des abus
        l’exige. Les éventuelles copies de sauvegarde techniques sont soumises
        aux politiques de conservation des prestataires techniques utilisés par
        le service et sont supprimées conformément à leurs cycles de rétention.
      </p>

      <h2>Vérification de la demande</h2>
      <p>
        Pour protéger votre compte contre une suppression non autorisée, nous
        pouvons demander une vérification raisonnable permettant de confirmer
        que la demande provient bien du titulaire du compte.
      </p>

      <h2>Besoin d’aide ?</h2>
      <p>
        Pour toute question concernant la suppression de votre compte ou de vos
        données, contactez-nous à :{" "}
        <a href={`mailto:${email}`}>{email}</a>.
      </p>
    </main>
  );
}
