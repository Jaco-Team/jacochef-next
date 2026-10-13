#!/usr/bin/env python3
"""CI-only checkout guard. Never prints environment-file names or values."""
import argparse
import base64
import json
import os
from pathlib import Path
import re
import subprocess


ENV_EXCLUDES = [".env", ".env.*", "**/.env", "**/.env.*", ".sentryclirc", "**/.sentryclirc"]
WEIGHT_SUFFIXES = (".gguf", ".safetensors", ".onnx", ".pt", ".pth", ".ckpt")
WEIGHT_EXCLUDES = ["**/*" + suffix for suffix in WEIGHT_SUFFIXES]
# Reviewed Dockerfile -> its Docker build context, both relative to the repository root.
DOCKERFILES = {
    "Dockerfile": ".",
    "docker/nginx/Dockerfile": ".",
    "ocr-lilt-service/Dockerfile": "ocr-lilt-service",
    "employee-photo-detect-service/Dockerfile": "employee-photo-detect-service",
}
# Local-development defaults of jacochef-next. Only these public key names are
# accepted; the Docker context excludes the files regardless.
PUBLIC_TRACKED_ENV = {".env.development", ".env.production"}
PUBLIC_TRACKED_ENV_LINE = re.compile(r"(NEXT_PUBLIC_API_URL|MUI_STYLE_ENGINE)=[^\r\n\0]*")


def write_synthetic_testing_fixture(root: Path) -> None:
    """Create an untracked Laravel fixture without reading or overwriting any env file."""
    if not (root / "artisan").is_file() or os.environ.get("APP_ENV") != "testing":
        raise ValueError("SYNTHETIC_FIXTURE_REQUIRES_BACKEND_TESTING")
    for name in (".env", ".env.testing"):
        if (root / name).exists() or (root / name).is_symlink():
            raise ValueError("EXISTING_RUNTIME_ENV_NOT_ALLOWED")
    # This fixed key is intentionally public, test-only, and NEVER a deploy key.
    # MySQL grammar is required by query-builder contract tests; nothing listens
    # on port 9, so a test that really connects fails instead of reaching a server.
    values = {
        "APP_NAME": '"Jaco Chef"',
        "APP_ENV": "testing",
        "APP_KEY": "base64:" + base64.b64encode(bytes(range(32))).decode("ascii"),
        "APP_DEBUG": "false",
        "APP_URL": "http://127.0.0.1",
        "LOG_CHANNEL": "null",
        "APP_MAINTENANCE_DRIVER": "file",
        "BCRYPT_ROUNDS": "4",
        "BROADCAST_CONNECTION": "null",
        "CACHE_STORE": "array",
        "DB_CONNECTION": "mysql",
        "DB_HOST": "127.0.0.1",
        "DB_PORT": "9",
        "DB_DATABASE": "jaco_ci_unreachable",
        "DB_USERNAME": "ci",
        "DB_PASSWORD": "",
        "REDIS_HOST": "127.0.0.1",
        "REDIS_PORT": "9",
        "MAIL_MAILER": "array",
        "QUEUE_CONNECTION": "sync",
        "SESSION_DRIVER": "array",
        "PULSE_ENABLED": "false",
        "TELESCOPE_ENABLED": "false",
        "NIGHTWATCH_ENABLED": "false",
        "SMARTCAPTCHA_ENABLED": "false",
        "OCR_LILT_ENABLED": "false",
    }
    path = root / ".env.testing"
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0), 0o600)
    with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
        handle.write("# Generated synthetic test fixture; never use for production.\n")
        handle.write("".join(name + "=" + value + "\n" for name, value in values.items()))


def public_tracked_env_only(path: Path) -> bool:
    if path.is_symlink() or not path.is_file():
        return False
    try:
        lines = path.read_bytes().decode("utf-8").splitlines()
    except UnicodeDecodeError:
        return False
    for line in lines:
        stripped = line.strip()
        if stripped and not stripped.startswith("#") and not PUBLIC_TRACKED_ENV_LINE.fullmatch(stripped):
            return False
    return True


def check_tracked(root: Path) -> None:
    tracked = subprocess.run(
        ["git", "ls-files", "-z"], cwd=root, check=True, capture_output=True
    ).stdout.split(b"\0")
    for raw in tracked:
        if not raw:
            continue
        name = os.fsdecode(raw)
        base = name.rsplit("/", 1)[-1]
        if base.lower().endswith(WEIGHT_SUFFIXES):
            raise ValueError("TRACKED_MODEL_WEIGHTS_PRESENT")
        if not base.startswith(".env") or base.endswith(".example"):
            continue
        if name in PUBLIC_TRACKED_ENV and public_tracked_env_only(root / name):
            continue
        # Even names may contain untrusted bytes; print neither names nor values.
        raise ValueError("TRACKED_RUNTIME_ENV_PRESENT")


def prepare(root: Path, dockerfile: str) -> dict:
    if dockerfile not in DOCKERFILES:
        raise ValueError("UNREVIEWED_DOCKERFILE")
    source = root / dockerfile
    if source.is_symlink() or not source.is_file():
        raise ValueError("UNSAFE_DOCKERFILE")
    context = root / DOCKERFILES[dockerfile]
    if context.is_symlink() or not context.is_dir():
        raise ValueError("UNSAFE_BUILD_CONTEXT")
    check_tracked(root)
    base = context / ".dockerignore"
    # BuildKit prefers <Dockerfile>.dockerignore next to the Dockerfile.
    specific = source.with_name(source.name + ".dockerignore")
    for candidate in (base, specific):
        if candidate.is_symlink() or (candidate.exists() and not candidate.is_file()):
            raise ValueError("UNSAFE_DOCKERIGNORE")
    original = specific if specific.exists() else base
    if not original.exists():
        raise ValueError("DOCKERIGNORE_MISSING")
    rules = original.read_text(encoding="utf-8")
    # Append exclusions LAST to override any earlier !.env.example exception.
    policy = rules.rstrip("\n") + "\n\n# Jaco CI: runtime env and model weights must never enter an image\n"
    policy += "\n".join(ENV_EXCLUDES + WEIGHT_EXCLUDES) + "\n"
    specific.write_text(policy, encoding="utf-8")
    os.chmod(specific, 0o600)
    return {"status": "passed", "dockerfile": dockerfile, "runtime_env_excluded": True}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dockerfile", required=True)
    parser.add_argument("--synthetic-testing-fixture", action="store_true")
    args = parser.parse_args()
    try:
        result = prepare(Path.cwd(), args.dockerfile)
        if args.synthetic_testing_fixture:
            write_synthetic_testing_fixture(Path.cwd())
            result["synthetic_testing_fixture_created"] = True
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        code = str(error) if isinstance(error, ValueError) else "CONTEXT_GUARD_FAILED"
        print(json.dumps({"status": "failed", "error_code": code}))
        raise SystemExit(1)
    print(json.dumps(result, sort_keys=True))


if __name__ == "__main__":
    main()
