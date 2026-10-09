#!/usr/bin/env bash
# One-time repository setup for the self-updating pipeline. Needs the GitHub CLI, logged in.
# Usage: scripts/setup-github.sh [owner/repo]
set -euo pipefail

repo="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"
echo "Configuring $repo"

# Allow auto-merge and tidy up merged branches.
gh api -X PATCH "repos/$repo" \
  -F allow_auto_merge=true \
  -F delete_branch_on_merge=true \
  -F allow_squash_merge=true >/dev/null

# Dependabot alerts and security updates.
gh api -X PUT "repos/$repo/vulnerability-alerts" >/dev/null
gh api -X PUT "repos/$repo/automated-security-fixes" >/dev/null

# Protect main: nothing merges unless the Verify job is green.
gh api -X PUT "repos/$repo/branches/main/protection" --input - >/dev/null <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["Verify"] },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON

gh label create "needs review" --repo "$repo" --color FBCA04 --force >/dev/null
gh label create "dependencies" --repo "$repo" --color 0366D6 --force >/dev/null

echo "Done. Now add NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID as repository secrets,"
echo "and SITE_URL (e.g. https://your-domain.ca) as a repository variable."
