# Deploy GrowDev to GitHub Pages: `growdev.werchti.tn`

Time: about 20 minutes of work, then a wait for DNS and the HTTPS certificate (usually under an hour).
Every command block below can be pasted as is. The GitHub username (`aziz-art`) is already filled in.

## What you need

| Item | Notes |
|---|---|
| A GitHub account | A free account is enough, but **GitHub Pages on a free account needs a public repository**. The site source contains no secret |
| `git` | `git --version` |
| `gh` (GitHub CLI), optional | Makes step 2 one command. Without it, use the website (option B) |
| OVHcloud access to the DNS zone of `werchti.tn` | Web Cloud → Domain names |
| This repository folder | Unzip `growdev-portfolio.zip` |

## Step 1: set your variables

Paste this first, in the terminal you will keep using.

```bash
GH_USER="aziz-art"
REPO="growdev-site"
DOMAIN="growdev.werchti.tn"
echo "Repository: https://github.com/$GH_USER/$REPO   Site: https://$DOMAIN/"
```

## Step 2: create the repository and push

Go to the project folder, run the checks once, then use **option A or B**.

```bash
unzip growdev-portfolio.zip && cd growdev-portfolio     # skip if you are already inside the folder
node tools/build.mjs && node tools/check.mjs            # must end with "All checks passed."
git init -b main
git add -A
git commit -m "GrowDev portfolio: three languages, SEO, GEO and AEO layer, build and checks"
```

**Option A, with the GitHub CLI** (log in once with `gh auth login`):

```bash
gh repo create "$GH_USER/$REPO" --public --source=. --remote=origin --push
```

**Option B, without it.** On github.com click **New repository**, name it `growdev-site`, choose **Public**, and tick **nothing** (no README, no `.gitignore`, no licence). Then:

```bash
git remote add origin "https://github.com/$GH_USER/$REPO.git"
git push -u origin main
```

The first workflow run starts by itself. It will fail at "Configure Pages" until step 3 is done. That is expected.

## Step 3: switch Pages to GitHub Actions

1. Open `https://github.com/aziz-art/growdev-site/settings/pages`.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Run the workflow again:

```bash
gh workflow run pages.yml --repo "$GH_USER/$REPO"      # or: Actions tab → latest run → Re-run all jobs
gh run watch --repo "$GH_USER/$REPO"                    # wait for the green tick
```

The site is now live at `https://aziz-art.github.io/growdev-site/`. Its pages will look unstyled there: the site is built for the root of a domain, and the custom domain in step 5 fixes that. Do not judge it from this address.

## Step 4: DNS at OVH

1. OVHcloud Control Panel → **Web Cloud → Domain names → `werchti.tn` → DNS zone**.
2. If a `growdev` record already exists (type A, AAAA or CNAME), delete it.
3. **Add an entry → CNAME**:

| Field | Value |
|---|---|
| Subdomain | `growdev` |
| Target | `aziz-art.github.io.`  ← **keep the final dot** |
| TTL | default |

🚨 **The final dot matters.** Without it OVH appends your own zone name and the target becomes `aziz-art.github.io.werchti.tn.`, which does not exist.

4. Do **not** touch the MX, SPF/DKIM TXT and Zimbra records: they carry your e-mail. Do **not** add a wildcard `*` record (it is a takeover risk, and GitHub advises against it).
5. Check from your terminal (it can take a few minutes, sometimes longer):

```bash
dig +short CNAME "$DOMAIN"        # expected: aziz-art.github.io.
dig +short CAA werchti.tn         # empty is fine; if there are records, one must contain letsencrypt.org
```

If a CAA record exists without Let's Encrypt, add one with value `0 issue "letsencrypt.org"`.

## Step 5: custom domain and HTTPS

1. Same page: `Settings → Pages → Custom domain`. Type `growdev.werchti.tn`, click **Save**.
2. GitHub runs a DNS check. When it says **DNS check successful**, wait for the certificate (minutes to about an hour), then tick **Enforce HTTPS**.
3. If the DNS check keeps failing after an hour, click **Remove**, wait a minute, and add the domain again. That restarts certificate provisioning.

## Step 6: verify the domain (recommended, 5 minutes)

This stops anyone else from claiming `growdev.werchti.tn` on GitHub if the repository is ever deleted or Pages is switched off.

1. GitHub → your profile picture → **Settings → Pages → Add a domain**. Enter `werchti.tn`.
2. GitHub shows a TXT record named `_github-pages-challenge-aziz-art.werchti.tn` and a value.
3. OVH → DNS zone → **Add an entry → TXT**. Subdomain: `_github-pages-challenge-aziz-art`. Value: exactly what GitHub shows.
4. Back on GitHub, click **Verify**. **Keep the TXT record forever.** It also covers `growdev.werchti.tn`.

## Step 7: check the launch with one script

The script also ships in the repository as `tools/verify-launch.sh`. This block recreates it, then runs it.

```bash
tee tools/verify-launch.sh >/dev/null <<'EOF'
#!/usr/bin/env bash
# Launch check for the GrowDev site.   Usage: bash tools/verify-launch.sh [domain]
D="${1:-growdev.werchti.tn}"
ok=0; ko=0
pass() { echo "  ok    $1"; ok=$((ok+1)); }
fail() { echo "  FAIL  $1"; ko=$((ko+1)); }
code() { curl -s -o /dev/null -w '%{http_code}' --max-time 25 "$1"; }
body() { curl -s --max-time 25 "$1"; }
expect_code() { [ "$(code "https://$D$1")" = "$2" ] && pass "$2 on $1" || fail "$1 should answer $2"; }
expect_text() { body "https://$D$1" | grep -Fq "$2" && pass "$1 contains: $2" || fail "$1 is missing: $2"; }

echo "DNS";   echo "  CNAME: $(dig +short CNAME "$D" 2>/dev/null | head -1)"
echo "Pages"
for p in / /ar/ /en/; do expect_code "$p" 200; done
expect_text /    'lang="fr" dir="ltr"'
expect_text /ar/ 'lang="ar" dir="rtl"'
expect_text /en/ 'lang="en" dir="ltr"'
expect_text /    "rel=\"canonical\" href=\"https://$D/\""
expect_text /ar/ "rel=\"canonical\" href=\"https://$D/ar/\""
expect_text /en/ "rel=\"canonical\" href=\"https://$D/en/\""
expect_text /en/ 'hreflang="x-default"'
echo "Search and AI files"
for f in /sitemap.xml /robots.txt /llms.txt /llms-full.txt; do expect_code "$f" 200; done
expect_text /sitemap.xml "https://$D/ar/"
expect_text /robots.txt  "Sitemap: https://$D/sitemap.xml"
echo "Share images"
for f in /assets/img/og-fr.jpg /assets/img/og-ar.jpg /assets/img/og-en.jpg; do expect_code "$f" 200; done
echo "HTTPS and 404"
loc=$(curl -sI --max-time 25 "http://$D/" | tr -d '\r' | awk 'tolower($1)=="location:"{print $2}')
case "$loc" in https://*) pass "http redirects to https";; *) fail "http does not redirect to https (Enforce HTTPS ticked?)";; esac
expect_code /does-not-exist 404
expect_text /does-not-exist "GrowDev"
echo; echo "$ok passed, $ko failed"; [ "$ko" -eq 0 ]
EOF
bash tools/verify-launch.sh "$DOMAIN"
```

Every line must say `ok`. Then follow the launch checklist in [SEO-GEO-AEO.md](SEO-GEO-AEO.md) §3 (Search Console, Bing, Google Business Profile, `sameAs`).

## Step 8: update the site later

```bash
# 1. edit text in src/i18n/fr.json, ar.json, en.json (same keys in all three)
node tools/build.mjs && node tools/check.mjs
git add -A && git commit -m "Update copy" && git push
# the site is updated in about a minute
```

Never edit `site/index.html`, `site/ar/index.html`, `site/en/index.html` or the other generated files by hand. See the README.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Workflow fails at **Configure Pages**: "Get Pages site failed" | Pages source is not set to GitHub Actions yet. Do step 3, then re-run |
| Workflow fails at **Check** | Read the line: it names the page and the problem (a missing translation, a broken link, a title too long…). Fix it in `src/`, rebuild, push |
| "DNS check unsuccessful", "InvalidDNSError" | The CNAME target is wrong (missing final dot, typo in the username) or has not propagated yet. Re-run the `dig` command. If a proxy such as Cloudflare's orange cloud sits in front, switch it to DNS only |
| **Enforce HTTPS** is greyed out | The certificate is still being issued. Wait up to an hour; if it persists, remove and re-add the custom domain (step 5.3). Check the CAA record |
| The page opens but has no styling at `aziz-art.github.io/growdev-site/` | Normal: only the custom domain serves the site from `/`. Use `https://growdev.werchti.tn/` |
| `404` on the custom domain right after the first deploy | The deployment is not finished, or the source is still "Deploy from a branch". Check the Actions tab and step 3 |
| You changed something but see the old page | GitHub caches files for about 10 minutes. Hard-refresh, or wait |
| E-mail at `@werchti.tn` stops working | A DNS edit touched MX or TXT records. Restore them from the OVH zone history and leave them alone |

## Roll back

```bash
git log --oneline -5                 # find the last good commit
git revert <bad-commit-sha>          # creates a fixing commit
git push                             # redeploys in about a minute
```

## References

- GitHub Docs: *Configuring a custom domain for your GitHub Pages site*, *Verifying your custom domain for GitHub Pages*, *Using custom workflows with GitHub Pages*.
- The workflow is `.github/workflows/pages.yml` (checkout v6, configure-pages v6, upload-pages-artifact v5, deploy-pages v5, all on Node 24). Dependabot proposes updates weekly.
