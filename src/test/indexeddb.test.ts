import { describe, expect, it } from "vitest";

describe("environnement IndexedDB simulé", () => {
  it("permet d'ouvrir et d'écrire dans une base locale", async () => {
    const requete = indexedDB.open("fondation-test", 1);

    requete.onupgradeneeded = () => {
      requete.result.createObjectStore("demandes", { keyPath: "id" });
    };

    const base = await new Promise<IDBDatabase>((resolve, reject) => {
      requete.onsuccess = () => resolve(requete.result);
      requete.onerror = () => reject(requete.error);
    });

    const transaction = base.transaction("demandes", "readwrite");
    transaction.objectStore("demandes").put({ id: "DEMO", statut: "BROUILLON" });

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    expect(base.objectStoreNames.contains("demandes")).toBe(true);
    base.close();
  });
});