#!/usr/bin/env bash

set -e -o pipefail

cd "$(dirname "$0")"

git mv ../*.pkl . || true
git mv ../*.md . || true
git mv ../PklProject* . || true
git mv ../actions/ . || true
git mv ../examples/ . || true
git mv ../tests/ . || true
git mv ../.github/ . || true

