#!/usr/bin/env python3
"""Generate a video with the kie.ai API: submit a task, poll it, download the result.

Needs an API key in KIE_API_KEY (get one at https://kie.ai -> API keys).

    export KIE_API_KEY=sk-...
    tools/kie-video.py --prompt "a slow dolly across a desk at night" --model veo3_fast

Veo models use the dedicated /veo endpoints; everything else goes through the
generic /jobs endpoints. kie.ai answers 200 even for errors, so the JSON `code`
field is what decides success, not the HTTP status.
"""

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

BASE = "https://api.kie.ai"


def call(path, key, payload=None, query=None):
    url = BASE + path
    if query:
        url += "?" + urllib.parse.urlencode(query)
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(
        url,
        data=data,
        method="POST" if data else "GET",
        headers={
            "Authorization": "Bearer " + key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = json.loads(resp.read().decode())
    except urllib.error.HTTPError as err:
        sys.exit("HTTP %s from %s: %s" % (err.code, path, err.read().decode()[:300]))
    except urllib.error.URLError as err:
        sys.exit("could not reach %s: %s" % (url, err.reason))

    if body.get("code") != 200:
        sys.exit("kie.ai refused %s: code=%s msg=%s" % (path, body.get("code"), body.get("msg")))
    return body.get("data") or {}


def urls_from(blob):
    """resultUrls comes back as a list, or as a JSON string holding one."""
    if not blob:
        return []
    if isinstance(blob, str):
        try:
            blob = json.loads(blob)
        except json.JSONDecodeError:
            return [blob]
    if isinstance(blob, dict):
        blob = blob.get("resultUrls") or blob.get("resultUrl") or []
    if isinstance(blob, str):
        return [blob]
    return list(blob)


def submit(args, key):
    if args.model.startswith("veo"):
        payload = {
            "prompt": args.prompt,
            "model": args.model,
            "aspectRatio": args.aspect,
            "enableFallback": args.fallback,
        }
        if args.image:
            payload["imageUrls"] = args.image
        return call("/api/v1/veo/generate", key, payload)["taskId"], True

    inp = {"prompt": args.prompt, "aspect_ratio": args.aspect}
    if args.duration:
        inp["duration"] = args.duration
    if args.image:
        inp["image_urls"] = args.image
    return call("/api/v1/jobs/createTask", key, {"model": args.model, "input": inp})["taskId"], False


def poll(task_id, veo, key, timeout, interval):
    deadline = time.time() + timeout
    last = None
    while time.time() < deadline:
        if veo:
            data = call("/api/v1/veo/record-info", key, query={"taskId": task_id})
            flag = data.get("successFlag")
            state = {0: "generating", 1: "success", 2: "fail", 3: "fail"}.get(flag, str(flag))
            found = urls_from(data.get("response"))
            error = data.get("errorMessage")
        else:
            data = call("/api/v1/jobs/recordInfo", key, query={"taskId": task_id})
            state = data.get("state")
            found = urls_from(data.get("resultJson"))
            error = data.get("failMsg")

        if state != last:
            print("  %s ..." % state, flush=True)
            last = state
        if state == "success":
            if not found:
                sys.exit("task reported success but returned no video URL")
            return found
        if state == "fail":
            sys.exit("generation failed: %s" % (error or "no reason given"))
        time.sleep(interval)
    sys.exit("gave up after %ss; task %s is still running (re-poll it later)" % (timeout, task_id))


def download(urls, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    saved = []
    for i, url in enumerate(urls):
        ext = os.path.splitext(urllib.parse.urlparse(url).path)[1] or ".mp4"
        dest = os.path.join(out_dir, "kie-video-%d%s" % (i, ext))
        with urllib.request.urlopen(url, timeout=300) as resp, open(dest, "wb") as fh:
            fh.write(resp.read())
        saved.append(dest)
    return saved


def main():
    ap = argparse.ArgumentParser(description="Generate a video with the kie.ai API.")
    ap.add_argument("--prompt", required=True, help="what the video should show")
    ap.add_argument("--model", default="veo3_fast",
                    help="veo3_fast, veo3, sora-2-text-to-video, kling-v3-0 ... (default: veo3_fast)")
    ap.add_argument("--aspect", default="16:9", help="16:9, 9:16 or 1:1 (default: 16:9)")
    ap.add_argument("--duration", help="seconds, for the models that accept it")
    ap.add_argument("--image", action="append",
                    help="public image URL to animate; repeat for several")
    ap.add_argument("--out", default="out", help="directory for the downloaded video")
    ap.add_argument("--timeout", type=int, default=900, help="seconds to wait (default: 900)")
    ap.add_argument("--poll", type=int, default=10, help="seconds between polls (default: 10)")
    ap.add_argument("--fallback", action="store_true",
                    help="let veo fall back to another provider if it is busy")
    args = ap.parse_args()

    key = os.environ.get("KIE_API_KEY")
    if not key:
        sys.exit("set KIE_API_KEY first (export KIE_API_KEY=...) — get one at https://kie.ai")

    print("submitting to %s ..." % args.model, flush=True)
    task_id, veo = submit(args, key)
    print("task %s accepted" % task_id, flush=True)

    urls = poll(task_id, veo, key, args.timeout, args.poll)
    for path in download(urls, args.out):
        print("saved %s" % path)


if __name__ == "__main__":
    main()
