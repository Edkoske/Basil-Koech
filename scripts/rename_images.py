#!/usr/bin/env python3
"""
Rename images in assets/images to friendly names.
Run with --apply to perform changes. By default it does a dry-run.
"""
import os
import argparse

MAPPING = {
    '1783231592429.jpg': 'hero-portrait.jpg',
    '1783231603086.jpg': 'about-image.jpg',
    '1783231605701.jpg': 'project-1.jpg',
    '1783231608079.jpg': 'project-2.jpg',
    '1783231615070.jpg': 'project-3.jpg',
    '1783231622535.jpg': 'gallery-1.jpg',
    '1783231625635.jpg': 'gallery-2.jpg',
    '1783231629033.jpg': 'gallery-3.jpg',
    '1783231637125.jpg': 'gallery-4.jpg',
    '1783231660560.jpg': 'gallery-5.jpg',
    '1783231672147.jpg': 'gallery-6.jpg',
    '1783231687876.jpg': 'extra-1.jpg',
}

IMAGES_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'images')
IMAGES_DIR = os.path.normpath(IMAGES_DIR)


def main(dry_run=True):
    print('Images directory:', IMAGES_DIR)
    if not os.path.isdir(IMAGES_DIR):
        print('Error: images directory not found:', IMAGES_DIR)
        return 1

    for src_name, dst_name in MAPPING.items():
        src = os.path.join(IMAGES_DIR, src_name)
        dst = os.path.join(IMAGES_DIR, dst_name)
        if not os.path.exists(src):
            print(f'MISSING: {src_name} -> {dst_name} (source not found)')
            continue
        if os.path.exists(dst):
            print(f'SKIP: {dst_name} already exists; would overwrite')
            continue
        print(('DRY' if dry_run else 'RENAME') + f': {src_name} -> {dst_name}')
        if not dry_run:
            os.rename(src, dst)
    print('Done.')
    return 0


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Rename images to friendly names')
    parser.add_argument('--apply', action='store_true', help='Perform renames (default is dry-run)')
    args = parser.parse_args()
    exit(main(dry_run=not args.apply))
