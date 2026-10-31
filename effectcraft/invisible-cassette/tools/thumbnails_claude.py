#!/usr/bin/env python3
"""Claude's three thumbnail ideas (Higgsfield, thumbnails/claude_src/*.jpg) with text -> thumbnails/thumb_claude_*.jpg.

Usage: python3 -I tools/thumbnails_claude.py      (run from effectcraft/invisible-cassette)
Human emotion and action instead of robots, each tied to a true moment in the film; same type and colours
as tools/thumbnails_user.py.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from thumbnails_user import make, AMBER, RED, WHITE, HERE

SRC = os.path.join(HERE, "thumbnails/claude_src")
# A · the freeze: a trader's shock, the crash in his glasses (May 6, 2010)
make("thumb_claude_a_trillion_gone.jpg", "freeze.jpg", [("$1 TRILLION", 120, WHITE), ("GONE", 210, RED)], "right", 360, 560, src_dir=SRC, fill=True, width=0.5)
# B · faster than a blink: the crash reflected in a human eye (machines act inside 100-400 ms)
make("thumb_claude_b_faster_than_you.jpg", "blink.jpg", [("FASTER", 170, WHITE), ("THAN YOU", 170, RED)], "right", 360, 560, src_dir=SRC, fill=True, width=0.5)
# C · the override: a hand that can't reach the emergency stop (the kill-switch chapter)
make("thumb_claude_c_too_late.jpg", "override.jpg", [("TOO", 190, WHITE), ("LATE", 230, RED)], "right", 360, 480, src_dir=SRC, fill=True, width=0.5)
