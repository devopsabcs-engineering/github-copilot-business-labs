export type ReponsesAdmissibilite = {
  entrepriseOuOrganisme: boolean;
  projetAuQuebec: boolean;
  donneesFictivesConfirmees: boolean;
};

export type ResultatAdmissibilite = {
  admissible: boolean;
  motifs: string[];
};

export function evaluerAdmissibilite(
  reponses: ReponsesAdmissibilite,
): ResultatAdmissibilite {
  const motifs: string[] = [];

  if (!reponses.entrepriseOuOrganisme) {
    motifs.push("Le programme fictif vise une entreprise ou un organisme.");
  }

  if (!reponses.projetAuQuebec) {
    motifs.push("Le projet de démonstration doit se dérouler au Québec.");
  }

  if (!reponses.donneesFictivesConfirmees) {
    motifs.push("Seules des données fictives peuvent être utilisées.");
  }

  return { admissible: motifs.length === 0, motifs };
}