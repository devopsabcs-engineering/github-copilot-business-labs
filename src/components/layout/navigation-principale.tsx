import Link from "next/link";

export function NavigationPrincipale() {
  return (
    <nav aria-label="Navigation principale">
      <ul className="navigation-liste">
        <li>
          <Link href="/programme">Le programme</Link>
        </li>
        <li>
          <Link href="/demandes">Parcours de démonstration</Link>
        </li>
        <li>
          <Link href="/lab">Laboratoire GitHub Copilot</Link>
        </li>
      </ul>
    </nav>
  );
}