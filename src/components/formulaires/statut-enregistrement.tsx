export function StatutEnregistrement({ message }: { message: string }) {
  return (
    <p className="statut-enregistrement" aria-live="polite" role="status">
      {message}
    </p>
  );
}