#!/usr/bin/env python3
"""Fails if an HTML file references a local file that doesn't exist,
or an in-page/cross-page anchor (#id) with no matching element id.
Used by the CI workflow to catch broken internal links before deploy."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML_FILES = sorted(ROOT.glob("*.html"))

LINK_RE = re.compile(r'(?:href|src)="([^"]+)"')
ID_RE = re.compile(r'\bid="([^"]+)"')

SKIP_PREFIXES = ("http://", "https://", "mailto:", "tel:", "data:", "javascript:")


def local_ids(html_text):
    return set(ID_RE.findall(html_text))


def check_file(path):
    errors = []
    text = path.read_text(encoding="utf-8")
    ids = local_ids(text)

    for link in LINK_RE.findall(text):
        if link.startswith(SKIP_PREFIXES) or link in ("#", ""):
            continue

        if link.startswith("#"):
            frag = link[1:]
            if frag not in ids:
                errors.append(f"{path.name}: ancre cassée '{link}' (aucun id=\"{frag}\" trouvé)")
            continue

        file_part, _, frag = link.partition("#")
        # Root-relative links ("/style.css") point to the site root, i.e. the repo root.
        base = ROOT if file_part.startswith("/") else path.parent
        target = (base / file_part.lstrip("/")).resolve()
        if not target.exists():
            errors.append(f"{path.name}: fichier introuvable pour le lien '{link}'")
            continue

        if frag and target.suffix == ".html":
            target_ids = local_ids(target.read_text(encoding="utf-8"))
            if frag not in target_ids:
                errors.append(f"{path.name}: ancre cassée '{link}' (aucun id=\"{frag}\" dans {file_part})")

    return errors


def main():
    all_errors = []
    for f in HTML_FILES:
        all_errors.extend(check_file(f))

    if all_errors:
        print("Liens cassés détectés :")
        for e in all_errors:
            print(f"  - {e}")
        sys.exit(1)

    print(f"OK : tous les liens internes de {len(HTML_FILES)} fichiers HTML sont valides.")


if __name__ == "__main__":
    main()
