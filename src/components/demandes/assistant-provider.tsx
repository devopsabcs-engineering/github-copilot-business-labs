"use client";

import { useSearchParams } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import type { ValeursAssistant } from "@/components/formulaires/champs-etapes";
import { StatutEnregistrement } from "@/components/formulaires/statut-enregistrement";
import { Button } from "@/components/ui/button";
import type {
  Demande,
  NumeroEtape,
  StatutSimule,
} from "@/lib/domaine/demande.types";
import {
  AntiRebondAutosauvegarde,
  resoudreConflit,
} from "@/lib/stockage/autosauvegarde";
import {
  demandesRepository,
  ErreurStockageLocal,
} from "@/lib/stockage/demandes.repository";

type ConflitAssistant = {
  versionLocale: Demande;
  versionRecente: Demande;
};

type AssistantContextValue = {
  demande: Demande;
  adopterDemande: (demande: Demande) => void;
  construireDemandeCourante: (etape?: NumeroEtape) => Demande;
  enregistrerMaintenant: (etape?: NumeroEtape) => Promise<boolean>;
  simulerTransmission: () => Promise<boolean>;
  avancerSimulation: (statutVise: StatutSimule) => Promise<boolean>;
};

const AssistantContext = createContext<AssistantContextValue | null>(null);

const VALEURS_INITIALES: ValeursAssistant = {
  organisation: {
    raisonSociale: "",
    courrielDemonstration: "",
  },
  projet: {
    titre: "",
    description: "",
    montantDemandeCents: undefined,
  },
  declarationConfirmee: false,
};

function valeursDepuisDemande(demande: Demande): ValeursAssistant {
  return {
    organisation: {
      raisonSociale: demande.organisation?.raisonSociale ?? "",
      courrielDemonstration:
        demande.organisation?.courrielDemonstration ?? "",
    },
    projet: {
      titre: demande.projet?.titre ?? "",
      description: demande.projet?.description ?? "",
      montantDemandeCents: demande.projet?.montantDemandeCents,
    },
    declarationConfirmee: demande.declarationConfirmee ?? false,
  };
}

function prochaineDateModification(dateActuelle: string): string {
  return new Date(
    Math.max(Date.now(), Date.parse(dateActuelle) + 1),
  ).toISOString();
}

export function AssistantProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const methodes = useForm<ValeursAssistant>({
    defaultValues: VALEURS_INITIALES,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const valeursObservees = useWatch({ control: methodes.control });
  const [demande, setDemande] = useState<Demande | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [conflit, setConflit] = useState<ConflitAssistant | null>(null);
  const [statutEnregistrement, setStatutEnregistrement] = useState("");
  const demandeRef = useRef<Demande | null>(null);
  const derniereValeurRef = useRef("");
  const chaineEcrituresRef = useRef<Promise<void>>(Promise.resolve());
  const autosauvegardeRef = useRef<AntiRebondAutosauvegarde<ValeursAssistant> | null>(
    null,
  );

  const adopterDemande = useCallback((nouvelleDemande: Demande) => {
    demandeRef.current = nouvelleDemande;
    setDemande(nouvelleDemande);
    setStatutEnregistrement(
      `Brouillon enregistré sur cet appareil à ${new Intl.DateTimeFormat("fr-CA", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(nouvelleDemande.dateModification))}`,
    );
  }, []);

  const construireDepuisValeurs = useCallback(
    (valeurs: ValeursAssistant, etape?: NumeroEtape): Demande => {
      const version = demandeRef.current;
      if (!version) {
        throw new ErreurStockageLocal("DEMANDE_INTROUVABLE");
      }

      return {
        ...version,
        etapeCourante: etape ?? version.etapeCourante,
        organisation: {
          identifiantDemonstration: "ORG-DEMO-001",
          raisonSociale: valeurs.organisation.raisonSociale,
          courrielDemonstration: valeurs.organisation.courrielDemonstration,
        },
        projet: {
          titre: valeurs.projet.titre,
          description: valeurs.projet.description,
          montantDemandeCents: Number.isFinite(valeurs.projet.montantDemandeCents)
            ? valeurs.projet.montantDemandeCents
            : undefined,
        },
        declarationConfirmee: valeurs.declarationConfirmee,
        dateModification: prochaineDateModification(version.dateModification),
      };
    },
    [],
  );

  const enregistrerValeurs = useCallback(
    async (valeurs: ValeursAssistant, etape?: NumeroEtape): Promise<boolean> => {
      const operation = chaineEcrituresRef.current
        .catch(() => undefined)
        .then(async () => {
          const versionPersistante = demandeRef.current;
          if (!versionPersistante) {
            return false;
          }

          const versionLocale = construireDepuisValeurs(valeurs, etape);
          setStatutEnregistrement("Enregistrement du brouillon…");

          try {
            await demandesRepository.mettreAJour(
              versionLocale,
              versionPersistante.dateModification,
            );
            derniereValeurRef.current = JSON.stringify(valeurs);
            adopterDemande(versionLocale);
            setErreur(null);
            return true;
          } catch (cause) {
            if (
              cause instanceof ErreurStockageLocal &&
              cause.code === "CONFLIT_MODIFICATION"
            ) {
              const versionRecente = await demandesRepository.lire(
                versionPersistante.id,
              );
              setConflit({ versionLocale, versionRecente });
            }

            setErreur(
              cause instanceof Error
                ? cause.message
                : "Le brouillon n’a pas pu être enregistré.",
            );
            setStatutEnregistrement("Enregistrement local interrompu.");
            return false;
          }
        });

      chaineEcrituresRef.current = operation.then(() => undefined);
      return operation;
    },
    [adopterDemande, construireDepuisValeurs],
  );

  if (!autosauvegardeRef.current) {
    autosauvegardeRef.current = new AntiRebondAutosauvegarde((valeurs) =>
      enregistrerValeurs(valeurs).then(() => undefined),
    );
  }

  useEffect(() => {
    let actif = true;

    async function hydrater() {
      setChargement(true);
      setErreur(null);

      if (!id) {
        setErreur("Demande introuvable sur cet appareil.");
        setChargement(false);
        return;
      }

      try {
        const versionPersistante = await demandesRepository.lire(id);
        if (!actif) {
          return;
        }

        const valeurs = valeursDepuisDemande(versionPersistante);
        demandeRef.current = versionPersistante;
        derniereValeurRef.current = JSON.stringify(valeurs);
        methodes.reset(valeurs);
        setDemande(versionPersistante);
      } catch (cause) {
        if (actif) {
          setErreur(
            cause instanceof Error
              ? cause.message
              : "Demande introuvable sur cet appareil.",
          );
        }
      } finally {
        if (actif) {
          setChargement(false);
        }
      }
    }

    void hydrater();
    return () => {
      actif = false;
      autosauvegardeRef.current?.annuler();
    };
  }, [id, methodes]);

  useEffect(() => {
    if (!demandeRef.current) {
      return;
    }

    const valeurs = valeursObservees as ValeursAssistant;
    const signature = JSON.stringify(valeurs);
    if (signature === derniereValeurRef.current) {
      return;
    }

    autosauvegardeRef.current?.planifier(valeurs);
  }, [valeursObservees]);

  const enregistrerMaintenant = useCallback(
    async (etape?: NumeroEtape) => {
      autosauvegardeRef.current?.annuler();
      return enregistrerValeurs(methodes.getValues(), etape);
    },
    [enregistrerValeurs, methodes],
  );

  const construireDemandeCourante = useCallback(
    (etape?: NumeroEtape) => construireDepuisValeurs(methodes.getValues(), etape),
    [construireDepuisValeurs, methodes],
  );

  const simulerTransmission = useCallback(async (): Promise<boolean> => {
    autosauvegardeRef.current?.annuler();
    const valeurs = methodes.getValues();
    const operation = chaineEcrituresRef.current
      .catch(() => undefined)
      .then(async () => {
        const versionPersistante = demandeRef.current;
        if (!versionPersistante) {
          return false;
        }

        setStatutEnregistrement("Simulation de la transmission locale…");
        try {
          const demandeTransmise = await demandesRepository.simulerTransmission(
            construireDepuisValeurs(valeurs, 5),
            versionPersistante.dateModification,
          );
          derniereValeurRef.current = JSON.stringify(valeurs);
          adopterDemande(demandeTransmise);
          setErreur(null);
          return true;
        } catch (cause) {
          setErreur(
            cause instanceof Error
              ? cause.message
              : "La simulation n’a pas pu être enregistrée.",
          );
          setStatutEnregistrement("Simulation locale interrompue.");
          return false;
        }
      });

    chaineEcrituresRef.current = operation.then(() => undefined);
    return operation;
  }, [adopterDemande, construireDepuisValeurs, methodes]);

  const avancerSimulation = useCallback(
    async (statutVise: StatutSimule): Promise<boolean> => {
      const operation = chaineEcrituresRef.current
        .catch(() => undefined)
        .then(async () => {
          const versionPersistante = demandeRef.current;
          if (!versionPersistante) {
            return false;
          }

          setStatutEnregistrement("Mise à jour du statut simulé…");
          try {
            const demandeAvancee = await demandesRepository.avancerStatutSimule(
              versionPersistante.id,
              statutVise,
            );
            adopterDemande(demandeAvancee);
            setErreur(null);
            return true;
          } catch (cause) {
            setErreur(
              cause instanceof Error
                ? cause.message
                : "Le statut simulé n’a pas pu être mis à jour.",
            );
            setStatutEnregistrement("Mise à jour locale interrompue.");
            return false;
          }
        });

      chaineEcrituresRef.current = operation.then(() => undefined);
      return operation;
    },
    [adopterDemande],
  );

  async function rechargerVersionRecente() {
    if (!conflit) {
      return;
    }

    const valeurs = valeursDepuisDemande(conflit.versionRecente);
    methodes.reset(valeurs);
    derniereValeurRef.current = JSON.stringify(valeurs);
    adopterDemande(conflit.versionRecente);
    setConflit(null);
    setErreur(null);
  }

  async function conserverMesChangements() {
    if (!conflit) {
      return;
    }

    const resolution = resoudreConflit(
      "CONSERVER_MES_CHANGEMENTS",
      {
        ...conflit.versionLocale,
        dateModification: prochaineDateModification(
          conflit.versionRecente.dateModification,
        ),
      },
      conflit.versionRecente,
    );

    try {
      await demandesRepository.mettreAJour(
        resolution.demande,
        conflit.versionRecente.dateModification,
        { forcer: resolution.forcer },
      );
      adopterDemande(resolution.demande);
      setConflit(null);
      setErreur(null);
    } catch (cause) {
      setErreur(cause instanceof Error ? cause.message : "Le conflit persiste.");
    }
  }

  if (chargement) {
    return (
      <main id="contenu-principal" className="conteneur page-etape" tabIndex={-1}>
        <p role="status">Chargement du brouillon local…</p>
      </main>
    );
  }

  if (!demande) {
    return (
      <main id="contenu-principal" className="conteneur page-etape" tabIndex={-1}>
        <h1>Demande introuvable sur cet appareil</h1>
        <p role="alert">{erreur ?? "Demande introuvable sur cet appareil."}</p>
      </main>
    );
  }

  return (
    <AssistantContext.Provider
      value={{
        demande,
        adopterDemande,
        avancerSimulation,
        construireDemandeCourante,
        enregistrerMaintenant,
        simulerTransmission,
      }}
    >
      <FormProvider {...methodes}>
        {conflit ? (
          <div className="bande-conflit" role="alert">
            <p>Cette demande a été modifiée dans un autre onglet.</p>
            <div className="actions">
              <Button onClick={rechargerVersionRecente}>Recharger la version récente</Button>
              <Button onClick={conserverMesChangements}>Conserver mes changements</Button>
            </div>
          </div>
        ) : null}
        {erreur && !conflit ? <p className="bande-erreur" role="alert">{erreur}</p> : null}
        {children}
        <StatutEnregistrement message={statutEnregistrement} />
      </FormProvider>
    </AssistantContext.Provider>
  );
}

export function useAssistant(): AssistantContextValue {
  const contexte = useContext(AssistantContext);
  if (!contexte) {
    throw new Error("useAssistant doit être utilisé dans AssistantProvider.");
  }
  return contexte;
}