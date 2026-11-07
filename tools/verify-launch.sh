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
