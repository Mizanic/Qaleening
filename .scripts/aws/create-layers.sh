#!/bin/bash
shopt -s expand_aliases
alias echo="echo -e"

source "$(dirname "$0")/../common.sh"
show_script_header "Create Lambda Layers" "Create the Lambda layers"
setup_cleanup



# Layers directory
LAYERS_DIR="${PROJECT_ROOT}/.layers"

# Requirements files
MAIN_REQUIREMENTS_FILE="${PROJECT_ROOT}/requirements.txt"

# Output directories
SHARED_OUTPUT_DIR=${LAYERS_DIR}/common/python
SHARED_LIB_CODE_DIR="${BACKEND_DIR}/src/shared"

# Create the layers directory
log_info "Deleting existing layers directory"
rm -rf ${LAYERS_DIR}

# Create the layers directory
log_info "Creating new layers directory"
mkdir -p ${LAYERS_DIR}

# Create the shared output directory
log_info "Creating shared output directory"
mkdir -p ${SHARED_OUTPUT_DIR}


# Install all the dependencies for offline development users
log_info "Installing dependencies in virtual environment"
uv pip install -r ${MAIN_REQUIREMENTS_FILE} --upgrade



# Copy the shared lib code
log_info "Copying shared lib code"
cp -r ${SHARED_LIB_CODE_DIR} ${SHARED_OUTPUT_DIR}/

log_success "Lambda layers created successfully"