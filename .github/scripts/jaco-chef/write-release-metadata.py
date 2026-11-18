#!/usr/bin/env python3
"""Emit nonsecret publication evidence. The controller independently verifies it."""
import importlib.util
import json
import os
from pathlib import Path
import re


COMPONENTS = {
    "backend": {
        "repository": "Jaco-Team/test-app-site",
        "event": "push",
        "images": {
            "php": "ghcr.io/jaco-team/jaco-chef-php",
            "nginx": "ghcr.io/jaco-team/jaco-chef-nginx",
            "ocr": "ghcr.io/jaco-team/jaco-chef-ocr",
            "photo-detect": "ghcr.io/jaco-team/jaco-chef-photo-detect",
        },
    },
    "frontend": {
        "repository": "Jaco-Team/jacochef-next",
        "event": "workflow_dispatch",
        "images": {"frontend": "ghcr.io/jaco-team/jaco-chef-frontend"},
    },
}
BRANCH = "main"
WORKFLOW_PATH = ".github/workflows/production-image.yml"
PUBLIC_HELPER = Path(__file__).with_name("prepare-public-build.py")


def public_helper():
    if PUBLIC_HELPER.is_symlink() or not PUBLIC_HELPER.is_file():
        raise ValueError("UNSAFE_PUBLIC_BUILD_HELPER")
    spec = importlib.util.spec_from_file_location("jaco_public_build", PUBLIC_HELPER)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def digest_variable(image_key: str) -> str:
    return "IMAGE_DIGEST_" + image_key.upper().replace("-", "_")


def metadata(values: dict) -> dict:
    component = values.get("COMPONENT", "")
    if component not in COMPONENTS:
        raise ValueError("UNREVIEWED_COMPONENT")
    reviewed = COMPONENTS[component]
    repository = reviewed["repository"]
    sha = values.get("GITHUB_SHA", "")
    if not re.fullmatch(r"[0-9a-f]{40}", sha):
        raise ValueError("INVALID_SOURCE_SHA")
    images = {}
    for key, image in reviewed["images"].items():
        digest = values.get(digest_variable(key), "")
        if not re.fullmatch(r"sha256:[0-9a-f]{64}", digest):
            raise ValueError("INVALID_IMAGE_DIGEST")
        images[key] = image + "@" + digest
    if values.get("GITHUB_EVENT_NAME") != reviewed["event"] or values.get("GITHUB_REF") != "refs/heads/" + BRANCH:
        raise ValueError("UNREVIEWED_EVENT_OR_BRANCH")
    if values.get("REQUIRED_CHECKS_RESULT") != "success":
        raise ValueError("REQUIRED_CHECKS_NOT_SUCCESSFUL")
    if values.get("GITHUB_REPOSITORY") != repository:
        raise ValueError("UNREVIEWED_REPOSITORY")
    run_id, attempt = values.get("GITHUB_RUN_ID", ""), values.get("GITHUB_RUN_ATTEMPT", "")
    if not re.fullmatch(r"[1-9][0-9]*", run_id) or not re.fullmatch(r"[1-9][0-9]*", attempt):
        raise ValueError("INVALID_RUN_ID")
    if values.get("GITHUB_WORKFLOW_REF") != repository + "/" + WORKFLOW_PATH + "@refs/heads/" + BRANCH:
        raise ValueError("INVALID_WORKFLOW_REF")
    result = {
        "schema_version": 3,
        "component": component,
        "repository": repository,
        "branch": BRANCH,
        "commit": sha,
        "images": images,
        "workflow_path": WORKFLOW_PATH,
        "run_id": int(run_id),
        "run_attempt": int(attempt),
        "required_checks": "passed",
        "public_config_sha256": None,
        "build_configuration": None,
        "build_request_id": None,
    }
    if component == "frontend":
        helper = public_helper()
        data, proof = helper.validate_dispatch(values)
        if any(values.get(name) != value for name, value in proof.items()):
            raise ValueError("PUBLIC_BUILD_PROOF_MISMATCH")
        actual_public = {name: values.get(name, "") for name in helper.PUBLIC_KEYS}
        if helper.validate_public_config(actual_public) != data:
            raise ValueError("PUBLIC_BUILD_ENV_MISMATCH")
        result["public_config_sha256"] = proof["VALIDATED_PUBLIC_CONFIG_SHA256"]
        result["build_configuration"] = {
            "kv_path": helper.BUILD_KV_PATH,
            "version": helper.positive_version(proof["VALIDATED_PUBLIC_CONFIG_VERSION"]),
        }
        result["build_request_id"] = helper.request_id(proof["VALIDATED_BUILD_REQUEST_ID"])
    return result


def main() -> None:
    try:
        result = metadata(dict(os.environ))
    except ValueError as error:
        print(json.dumps({"status": "failed", "error_code": str(error)}))
        raise SystemExit(1)
    root = Path("jaco-release-metadata")
    if root.is_symlink() or root.exists():
        raise SystemExit("RELEASE_METADATA_PATH_ALREADY_EXISTS")
    root.mkdir(mode=0o700)
    path = root / "component.json"
    path.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    path.chmod(0o600)
    print(json.dumps({"status": "passed", "component": result["component"], "metadata_written": True}))


if __name__ == "__main__":
    main()
