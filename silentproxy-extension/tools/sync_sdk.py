#!/usr/bin/env python3
"""Copy the SDK into the website, so the two never drift apart.

`silentproxy-extension/sdk/silentproxy-client.js` is the canonical copy. The website is a
plain static site with no build step, so it needs its own file at `docs/js/silentproxy-client.js`.
Run this after editing the SDK; `tools/build.py` does it for you.

The website's own test suite fails if the two files differ, so a stale copy cannot ship.
"""
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "sdk" / "silentproxy-client.js"
TARGET = ROOT.parent / "docs" / "js" / "silentproxy-client.js"


def sync() -> bool:
    """Copy the SDK to the website. Returns False when there is no website to sync to."""
    if not TARGET.parent.is_dir():
        print(f"note: no website at {TARGET.parent} - skipped the SDK copy")
        return False
    if not SOURCE.is_file():
        sys.exit(f"missing {SOURCE}")
    shutil.copyfile(SOURCE, TARGET)
    print(f"synced {SOURCE.relative_to(ROOT.parent)} -> {TARGET.relative_to(ROOT.parent)}")
    return True


if __name__ == "__main__":
    sync()
