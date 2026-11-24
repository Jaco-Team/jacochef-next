#!/usr/bin/env python3
"""Validate an OpenBao-origin public snapshot; never contact OpenBao from CI."""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import re
import stat
import uuid
from urllib.parse import urlsplit


PUBLIC_KEYS = ("NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY")
MAX_JSON_BYTES = 4096
MAX_VALUE_CHARACTERS = 512
BUILD_KV_PATH = "projects/chef/prod/frontend-build"
REPOSITORY = "Jaco-Team/jacochef-next"
BRANCH = "main"
API_HOSTS = {"jacosoft-dop.ru"}
SMARTCAPTCHA_CLIENT_KEY = re.compile(r"ysc1_[A-Za-z0-9]{16,128}")


def _url(value: str, hosts: set[str], path_pattern: str) -> None:
    try:
        url = urlsplit(value)
        valid = (
            url.scheme == "https"
            and url.netloc in hosts
            and re.fullmatch(path_pattern, url.path) is not None
            and not url.query
            and not url.fragment
        )
    except ValueError:
        valid = False
    if not valid:
        raise ValueError("UNREVIEWED_PUBLIC_URL")


def validate_public_config(data: object) -> dict[str, str]:
    if not isinstance(data, dict) or set(data) != set(PUBLIC_KEYS):
        raise ValueError("PUBLIC_CONFIG_KEYS_MISMATCH")
    result = {}
    for name in PUBLIC_KEYS:
        value = data[name]
        if not isinstance(value, str) or len(value) > MAX_VALUE_CHARACTERS:
            raise ValueError("PUBLIC_CONFIG_VALUE_INVALID")
        if any(character in value for character in "\r\n\0"):
            raise ValueError("PUBLIC_CONFIG_CONTROL_CHARACTER")
        # build-push-action parses build-args as CSV and trims input values.
        # Reject values that would change between fingerprint and Docker argv.
        if value != value.strip() or '"' in value or "," in value:
            raise ValueError("PUBLIC_CONFIG_BUILD_ARG_NORMALIZATION")
        result[name] = value
    # A bounded allowlist is not proof of the approved release value.
    # The controller additionally pins the exact OpenBao version/fingerprint.
    _url(result["NEXT_PUBLIC_API_URL"], API_HOSTS, r"/api")
    if not SMARTCAPTCHA_CLIENT_KEY.fullmatch(result["NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY"]):
        raise ValueError("PUBLIC_TOKEN_FORMAT_INVALID")
    if len(json.dumps(result, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode()) > MAX_JSON_BYTES:
        raise ValueError("PUBLIC_CONFIG_TOO_LARGE")
    return result


def fingerprint(data: object) -> str:
    validated = validate_public_config(data)
    canonical = json.dumps(validated, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
    return hashlib.sha256(canonical).hexdigest()


def _unique_object(pairs: list[tuple[str, object]]) -> dict:
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("PUBLIC_CONFIG_DUPLICATE_KEY")
        result[key] = value
    return result


def parse_public_config(raw: str) -> dict[str, str]:
    if not isinstance(raw, str) or len(raw.encode("utf-8")) > MAX_JSON_BYTES:
        raise ValueError("PUBLIC_CONFIG_TOO_LARGE")
    try:
        data = json.loads(raw, object_pairs_hook=_unique_object)
    except json.JSONDecodeError:
        raise ValueError("PUBLIC_CONFIG_INVALID_JSON") from None
    return validate_public_config(data)


def positive_version(raw: str) -> int:
    if not re.fullmatch(r"[1-9][0-9]{0,9}", raw) or int(raw) > 2147483647:
        raise ValueError("INVALID_PUBLIC_CONFIG_VERSION")
    return int(raw)


def request_id(raw: str) -> str:
    try:
        parsed = uuid.UUID(raw)
    except (ValueError, AttributeError):
        raise ValueError("INVALID_BUILD_REQUEST_ID") from None
    if str(parsed) != raw or parsed.int == 0 or parsed.version != 4 or parsed.variant != uuid.RFC_4122:
        raise ValueError("INVALID_BUILD_REQUEST_ID")
    return raw


def validate_dispatch(values: dict[str, str]) -> tuple[dict[str, str], dict[str, str]]:
    source = values.get("SOURCE_SHA", "")
    if not re.fullmatch(r"[a-f0-9]{40}", source) or source != values.get("GITHUB_SHA"):
        raise ValueError("DISPATCH_HEAD_MISMATCH")
    if values.get("GITHUB_EVENT_NAME") != "workflow_dispatch" or values.get("GITHUB_REF") != "refs/heads/" + BRANCH:
        raise ValueError("UNREVIEWED_DISPATCH_EVENT_OR_REF")
    if values.get("GITHUB_REPOSITORY") != REPOSITORY:
        raise ValueError("UNREVIEWED_REPOSITORY")
    expected = REPOSITORY + "/.github/workflows/production-image.yml@refs/heads/" + BRANCH
    if values.get("GITHUB_WORKFLOW_REF") != expected or values.get("DISPATCH_WORKFLOW_SHA") != source:
        raise ValueError("UNREVIEWED_DISPATCH_WORKFLOW")
    data = parse_public_config(values.get("PUBLIC_CONFIG_JSON", ""))
    digest = fingerprint(data)
    expected_digest = values.get("PUBLIC_CONFIG_SHA256", "")
    if not re.fullmatch(r"[a-f0-9]{64}", expected_digest) or digest != expected_digest:
        raise ValueError("PUBLIC_CONFIG_FINGERPRINT_MISMATCH")
    version = positive_version(values.get("PUBLIC_CONFIG_VERSION", ""))
    identifier = request_id(values.get("BUILD_REQUEST_ID", ""))
    proof = {
        "VALIDATED_SOURCE_SHA": source,
        "VALIDATED_PUBLIC_CONFIG_SHA256": digest,
        "VALIDATED_PUBLIC_CONFIG_VERSION": str(version),
        "VALIDATED_BUILD_REQUEST_ID": identifier,
    }
    return data, proof


def write_github_env(path: Path, runner_temp: Path, values: dict[str, str]) -> None:
    expected_names = set(PUBLIC_KEYS) | {
        "VALIDATED_SOURCE_SHA", "VALIDATED_PUBLIC_CONFIG_SHA256",
        "VALIDATED_PUBLIC_CONFIG_VERSION", "VALIDATED_BUILD_REQUEST_ID",
    }
    if set(values) != expected_names or any(
        not isinstance(value, str) or any(character in value for character in "\r\n\0")
        for value in values.values()
    ):
        raise ValueError("INVALID_PUBLIC_RUNNER_ENV")
    if path.is_symlink() or not path.is_file():
        raise ValueError("UNSAFE_GITHUB_ENV_PATH")
    try:
        path.resolve().relative_to(runner_temp.resolve())
    except ValueError:
        raise ValueError("GITHUB_ENV_OUTSIDE_RUNNER_TEMP") from None
    descriptor = os.open(path, os.O_WRONLY | os.O_APPEND | getattr(os, "O_NOFOLLOW", 0))
    try:
        record = os.fstat(descriptor)
        if not stat.S_ISREG(record.st_mode) or record.st_uid != os.getuid() or record.st_mode & 0o022:
            raise ValueError("UNSAFE_GITHUB_ENV_FILE")
        text = "".join(name + "=" + value + "\n" for name, value in values.items())
        with os.fdopen(descriptor, "w", encoding="utf-8", closefd=False) as handle:
            handle.write(text)
            handle.flush()
    finally:
        os.close(descriptor)


def main() -> None:
    try:
        data, proof = validate_dispatch(dict(os.environ))
        env_path = os.environ.get("GITHUB_ENV", "")
        temporary = os.environ.get("RUNNER_TEMP", "")
        if not env_path or not temporary:
            raise ValueError("MISSING_RUNNER_ENVIRONMENT")
        write_github_env(Path(env_path), Path(temporary), {**data, **proof})
    except (ValueError, OSError) as error:
        code = str(error) if isinstance(error, ValueError) else "PUBLIC_ENV_WRITE_FAILED"
        print(json.dumps({"status": "failed", "error_code": code}))
        raise SystemExit(1)
    print(json.dumps({"status": "passed", "public_config_sha256": proof["VALIDATED_PUBLIC_CONFIG_SHA256"]}))


if __name__ == "__main__":
    main()
