"""Quick endpoint test script for Astra backend."""
import urllib.request
import json
import io
import wave
import sys
import numpy as np
import uuid

API = "http://127.0.0.1:8000"


def test_health():
    r = urllib.request.urlopen(f"{API}/health", timeout=10)
    data = json.loads(r.read().decode())
    print(f"  health: {data}")
    return data.get("ollama", False)


def test_chat():
    body = json.dumps({"message": "Say just the word 'pong'", "session": "test_auto"}).encode()
    req = urllib.request.Request(f"{API}/chat", data=body, headers={"Content-Type": "application/json"})
    r = urllib.request.urlopen(req, timeout=120)
    data = json.loads(r.read().decode())
    print(f"  chat: response='{data['response'][:80]}', time={data['time_ms']:.0f}ms")
    return True


def test_stt():
    # Generate a 1-second WAV
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        t = np.linspace(0, 1, 16000, dtype=np.float32)
        samples = (0.3 * np.sin(2 * np.pi * 440 * t) * 32767).astype(np.int16)
        wf.writeframes(samples.tobytes())
    wav_data = buf.getvalue()

    boundary = uuid.uuid4().hex
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="audio"; filename="test.wav"\r\n'
        f"Content-Type: audio/wav\r\n\r\n"
    ).encode() + wav_data + f"\r\n--{boundary}--\r\n".encode()

    req = urllib.request.Request(
        f"{API}/voice/stt",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    r = urllib.request.urlopen(req, timeout=60)
    data = json.loads(r.read().decode())
    print(f"  stt: text='{data.get('text', '')}', lang={data.get('language', '')}")
    return True


def test_tts():
    import urllib.parse
    body = urllib.parse.urlencode({"text": "Hello from Astra", "voice": "default"}).encode()
    req = urllib.request.Request(
        f"{API}/voice/tts",
        data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    r = urllib.request.urlopen(req, timeout=30)
    ct = r.headers.get("Content-Type", "")
    size = len(r.read())
    print(f"  tts: content_type={ct}, size={size} bytes")
    return size > 0


def test_voice_pipeline():
    # Generate a 1-second WAV 
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        t = np.linspace(0, 1, 16000, dtype=np.float32)
        samples = (0.3 * np.sin(2 * np.pi * 440 * t) * 32767).astype(np.int16)
        wf.writeframes(samples.tobytes())
    wav_data = buf.getvalue()

    boundary = uuid.uuid4().hex
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="audio"; filename="test.wav"\r\n'
        f"Content-Type: audio/wav\r\n\r\n"
    ).encode() + wav_data + (
        f"\r\n--{boundary}\r\n"
        f'Content-Disposition: form-data; name="session"\r\n\r\n'
        f"test_voice\r\n"
        f"--{boundary}--\r\n"
    ).encode()

    req = urllib.request.Request(
        f"{API}/voice",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    r = urllib.request.urlopen(req, timeout=120)
    data = json.loads(r.read().decode())
    print(f"  voice: user='{data.get('user_text', '')[:60]}', resp='{data.get('response', '')[:60]}', has_audio={bool(data.get('audio'))}")
    return True


def test_sessions():
    r = urllib.request.urlopen(f"{API}/sessions", timeout=10)
    data = json.loads(r.read().decode())
    print(f"  sessions: {data['sessions']}")
    return True


def test_gallery():
    for kind in ["images", "videos", "audio"]:
        r = urllib.request.urlopen(f"{API}/gallery/{kind}", timeout=10)
        data = json.loads(r.read().decode())
        count = len(data.get(kind, []))
        print(f"  gallery/{kind}: {count} items")
    return True


def test_avatar_profile():
    try:
        r = urllib.request.urlopen(f"{API}/avatar/profile", timeout=10)
        data = json.loads(r.read().decode())
        print(f"  avatar/profile: {data}")
        return True
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode())
        print(f"  avatar/profile: {e.code} - {body.get('error', body)}")
        return e.code == 404  # Expected when no avatar is uploaded


def test_train_jobs():
    r = urllib.request.urlopen(f"{API}/train/jobs", timeout=10)
    data = json.loads(r.read().decode())
    print(f"  train/jobs: {len(data.get('jobs', []))} jobs")
    return True


def test_train_models():
    r = urllib.request.urlopen(f"{API}/train/models", timeout=10)
    data = json.loads(r.read().decode())
    print(f"  train/models: {len(data.get('models', []))} models")
    return True


def run_test(name, fn):
    try:
        ok = fn()
        status = "PASS" if ok else "FAIL"
    except Exception as e:
        status = "FAIL"
        print(f"  ERROR: {e}")
    print(f"  [{status}] {name}\n")
    return status == "PASS"


if __name__ == "__main__":
    test = sys.argv[1] if len(sys.argv) > 1 else "all"
    
    tests = {
        "health": test_health,
        "chat": test_chat,
        "stt": test_stt,
        "tts": test_tts,
        "voice": test_voice_pipeline,
        "sessions": test_sessions,
        "gallery": test_gallery,
        "avatar": test_avatar_profile,
        "train_jobs": test_train_jobs,
        "train_models": test_train_models,
    }
    
    if test == "all":
        results = {}
        for name, fn in tests.items():
            print(f"Testing {name}...")
            results[name] = run_test(name, fn)
        
        passed = sum(1 for v in results.values() if v)
        total = len(results)
        print(f"\n{'='*40}")
        print(f"Results: {passed}/{total} passed")
        for name, ok in results.items():
            print(f"  {'PASS' if ok else 'FAIL'}: {name}")
    else:
        if test in tests:
            print(f"Testing {test}...")
            run_test(test, tests[test])
        else:
            print(f"Unknown test: {test}. Available: {', '.join(tests.keys())}")
