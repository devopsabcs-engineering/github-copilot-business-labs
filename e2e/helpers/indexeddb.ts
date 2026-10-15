import type { Page } from "@playwright/test";

export async function effacerIndexedDb(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(async () => {
    const bases = await indexedDB.databases();
    await Promise.all(
      bases.map(
        ({ name }) =>
          new Promise<void>((resolve, reject) => {
            if (!name) {
              resolve();
              return;
            }

            const requete = indexedDB.open(name);
            requete.onerror = () => reject(requete.error);
            requete.onsuccess = () => {
              const database = requete.result;
              const stores = Array.from(database.objectStoreNames);
              if (stores.length === 0) {
                database.close();
                resolve();
                return;
              }

              const transaction = database.transaction(stores, "readwrite");
              stores.forEach((store) => transaction.objectStore(store).clear());
              transaction.oncomplete = () => {
                database.close();
                resolve();
              };
              transaction.onerror = () => {
                database.close();
                reject(transaction.error);
              };
            };
          }),
      ),
    );
  });
}