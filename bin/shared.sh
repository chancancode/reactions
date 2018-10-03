set -Eeuo pipefail

RED="\033[0;31m"
GREEN="\033[0;32m"
CYAN="\033[0;36m"
YELLOW="\033[1;33m"
CLEAR="\033[0m"

save() {
  echo -ne "\033[s"
}

restore() {
  echo -ne "\033[u"
}

step() {
  echo -ne "\r"
  save
  echo -ne "${CLEAR}................................................... [      ]"
  echo -e "\r${1} "
  current_step="${1}"
}

ok() {
  clear_status
  echo -ne "\033[1A"
  echo -e "\r\033[55C${GREEN}OK${CLEAR}"
}

skip() {
  clear_status
  echo -ne "\033[1A"
  echo -e "\r\033[54C${YELLOW}SKIP${CLEAR}"
}

fail() {
  clear_status
  echo -ne "\033[1A"
  echo -e "\r\033[54C${RED}FAIL${CLEAR}"

  if [ -z ${SOFT_FAIL:-} ]; then
    echo -e "\n${YELLOW}${1:-"Please run ./bin/configure!"}${CLEAR}"
    exit 1
  else
    FAIL="${1:-"Please run ./bin/configure!"}"
  fi
}

status() {
  clear_status
  echo -ne "\n${CYAN}${1}${CLEAR}"
}

clear_status() {
  echo -ne "\r\033[K"
  restore
  step "${current_step}"
}

check_exists() {
  step "Checking ${2}"

  if [ $1 "$2" ]; then
    ok
  else
    fail
  fi
}

check_command() {
  step "Checking ${1}"

  if $1 ${2:-"--version"} > /dev/null 2>&1; then
    ok
  else
    fail "Please install $1!"
  fi
}

try_command() {
  status "This may take a while..."

  if $1 > /dev/null 2>&1; then
    ok
  else
    fail "Try running ${CYAN}${1}${YELLOW} and check for any errors."
  fi
}

clear
save
