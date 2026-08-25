"""Extract the largest embedded JPEG preview from a Nikon NEF file."""

from __future__ import annotations

import argparse
import io
from pathlib import Path

from PIL import Image


def extract_largest_jpeg(source: Path) -> tuple[bytes, tuple[int, int]]:
    payload = source.read_bytes()
    candidates: list[tuple[int, int, bytes, tuple[int, int]]] = []
    cursor = 0

    while True:
        start = payload.find(b"\xff\xd8", cursor)
        if start < 0:
            break
        end = payload.find(b"\xff\xd9", start + 2)
        if end < 0:
            break
        jpeg = payload[start : end + 2]
        try:
            with Image.open(io.BytesIO(jpeg)) as image:
                image.verify()
            with Image.open(io.BytesIO(jpeg)) as image:
                size = image.size
            candidates.append((size[0] * size[1], len(jpeg), jpeg, size))
        except Exception:
            pass
        cursor = start + 2

    if not candidates:
        raise RuntimeError(f"No embedded JPEG preview found in {source}")

    _, _, jpeg, size = max(candidates, key=lambda item: (item[0], item[1]))
    return jpeg, size


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()

    jpeg, size = extract_largest_jpeg(args.source)
    args.destination.parent.mkdir(parents=True, exist_ok=True)
    args.destination.write_bytes(jpeg)
    print(f"{args.source.name} -> {args.destination.name} ({size[0]}x{size[1]})")


if __name__ == "__main__":
    main()
