#!/bin/bash

source "$(dirname "$0")/../common.sh"
show_script_header "Mobile Dev" "Start the mobile dev server"
setup_cleanup

## Run `npx expo run:android` to build the app for Android and install the debug version
## This is needed for proper hot reloading of the app

log_warning "If the app is not refreshing, consider running 'npx expo run:android'"

log_info "Setting ADB_SERVER_SOCKET to $ADB_SERVER_SOCKET"
export ADB_SERVER_SOCKET=tcp:localhost:5037
log_info "ADB_SERVER_SOCKET: $ADB_SERVER_SOCKET"

log_info "Starting mobile dev server..."
cd $MOBILE_DIR && npx expo start