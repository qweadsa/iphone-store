#!/usr/bin/env bash
# One-time: allow this Windows machine to SSH deploy without a password.
# Run on server: bash deploy/install-deploy-key.sh

set -euo pipefail

PUBKEY='ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHffCLGHFQQxb+X+HRPxio5GNcbgApIEgl1QLblNwVh+ Administrator@USER-20250701AZ'

mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

if grep -qF 'IHffCLGHFQQxb+X+HRPxio5GNcbgApIEgl1QLblNwVh+' ~/.ssh/authorized_keys; then
  echo "Deploy key already installed."
else
  echo "$PUBKEY" >> ~/.ssh/authorized_keys
  echo "Deploy key installed."
fi
