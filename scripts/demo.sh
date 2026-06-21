#!/usr/bin/env bash
#
# QwenFlow — end-to-end demo script.
#
# Spins up the orchestrator server, creates a two-step Qwen3 workflow,
# runs it, prints the results, lists the available models, and tears down.
#
# Usage:
#   bash scripts/demo.sh
#
# Optional: export DASHSCOPE_API_KEY=sk-... before running if you want the
# Model Router to hit the real Qwen Cloud endpoints. Without a key the server
# still starts and every endpoint responds; the run step will report whatever
# the router returns (real response or error) without crashing the demo.
#
# Requires: bash, curl, Node.js 18+. `jq` is optional — used to pretty-print
# JSON if present, otherwise the script falls back to raw output.
# -----------------------------------------------------------------------------

set -u

BASE_URL="${QWENFLOW_BASE_URL:-http://localhost:3000}"
SERVER_PID=""

# Pretty-print JSON if jq is available, otherwise echo the raw payload.
pretty() {
  if command -v jq >/dev/null 2>&1; then
    jq '.' - 2>/dev/null || cat
  else
    cat
  fi
}

# Extract a single field from JSON: json_get '<json>' '.field'
json_get() {
  local body="$1" query="$2"
  if command -v jq >/dev/null 2>&1; then
    echo "$body" | jq -r "$query" 2>/dev/null
  else
    # Fallback: grab "id":"wf-..." with grep/sed. Good enough for the demo.
    echo "$body" | sed -n 's/.*"id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1
  fi
}

cleanup() {
  if [[ -n "${SERVER_PID}" ]] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    echo ""
    echo "Stopping server (pid ${SERVER_PID})..."
    kill "${SERVER_PID}" 2>/dev/null || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

clear 2>/dev/null || true

echo "=== QwenFlow Demo ==="
echo ""

# --- 1. Start the server in the background ----------------------------------
echo "Starting QwenFlow server at ${BASE_URL} ..."
npm start >/tmp/qwenflow-demo-server.log 2>&1 &
SERVER_PID=$!

# --- 2. Wait for it to come up ----------------------------------------------
sleep 2

if ! curl -sf "${BASE_URL}/health" >/dev/null 2>&1; then
  echo "ERROR: server did not become healthy in time."
  echo "----- server log -----"
  cat /tmp/qwenflow-demo-server.log
  exit 1
fi
echo "Server is up. Health check:"
curl -sf "${BASE_URL}/health" | pretty
echo ""

# --- 3. Create a two-step workflow ------------------------------------------
echo "Creating workflow: 'Demo Workflow' (qwen3-8b -> qwen3-4b) ..."
CREATE_RES=$(curl -sf -X POST "${BASE_URL}/api/workflows" \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Workflow","steps":[{"id":"s1","model":"qwen3-8b","prompt":"Analyze the market sentiment for Bitcoin today"},{"id":"s2","model":"qwen3-4b","prompt":"Summarize the analysis in one sentence"}]}')

if [[ -z "${CREATE_RES}" ]]; then
  echo "ERROR: failed to create workflow."
  exit 1
fi

WORKFLOW_ID=$(json_get "${CREATE_RES}" '.id')
echo "Created workflow id: ${WORKFLOW_ID}"
echo "Full workflow object:"
echo "${CREATE_RES}" | pretty
echo ""

# --- 4. Run the workflow ----------------------------------------------------
echo "Running workflow ${WORKFLOW_ID} ..."
echo ""
RUN_RES=$(curl -sf -X POST "${BASE_URL}/api/workflows/${WORKFLOW_ID}/run" || echo "")

# --- 5. Display the results, formatted nicely -------------------------------
echo "Results:"
if [[ -n "${RUN_RES}" ]]; then
  echo "${RUN_RES}" | pretty
else
  echo "(no response body — is DASHSCOPE_API_KEY set for live Qwen Cloud calls?)"
fi
echo ""

# --- 6. List available models -----------------------------------------------
echo "Available models on this QwenFlow instance:"
curl -sf "${BASE_URL}/api/models" | pretty
echo ""

# --- 7. Tear down -----------------------------------------------------------
echo "Demo finished. Shutting down server."
cleanup

echo ""
echo "=== Demo Complete ==="
