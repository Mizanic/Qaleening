# ===============================
# Kaleening Project Makefile
# ===============================

# --- Core Configuration ---
STACK ?= --all
ENV ?= dev
SOURCE ?= all
PROJECT_NAME ?= Kaleening

# --- Project Paths ---
SCRIPTS_DIR := .scripts
BACKEND_DIR := aws
ADMIN_DIR := admin
MOBILE_DIR := app

# --- Categorized Script Directories ---
AWS_SCRIPTS_DIR := $(SCRIPTS_DIR)/aws
TESTING_SCRIPTS_DIR := $(SCRIPTS_DIR)/testing
BUILD_SCRIPTS_DIR := $(SCRIPTS_DIR)/build
UTILS_SCRIPTS_DIR := $(SCRIPTS_DIR)/utils

# --- Default Target ---
.DEFAULT_GOAL := help

# ===============================
# MODULAR MAKEFILE INCLUDES
# ===============================

include .makefiles/infrastructure.mk
include .makefiles/testing.mk
include .makefiles/frontend.mk
include .makefiles/setup.mk

# ===============================
# MAIN HELP SYSTEM
# ===============================

help:
	@echo "Kaleening Project - Available Commands"
	@echo "====================================="
	@echo ""
	@echo "Usage: make [target] [VAR=value]"
	@echo ""
	@echo "🏗️  Infrastructure:"
	@echo "  deploy         Deploy stack(s) [STACK=name]"
	@echo "  hotswap        Hotswap stack(s) for development"
	@echo "  destroy        Destroy stack(s)"
	@echo "  watch          Watch for changes"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  check-errors   Check Lambda errors"
	@echo ""
	@echo "🖥️  Frontend:"
	@echo "  mobile-dev     Start mobile dev server"
	@echo ""
	@echo "⚙️  Setup:"
	@echo "  layers         Create Lambda layers"
	@echo "  config-env     Configure environment"
	@echo ""
	@echo "🔧 Utilities:"
	@echo "  clean          Clean build artifacts"
	@echo "  status         Show project status"
	@echo ""
	@echo "📋 Quick Examples:"
	@echo "  make deploy STACK=Api"
	@echo "  make hotswap STACK=Api"

# ===============================
# LEGACY COMPATIBILITY
# ===============================
# The modular makefiles already define these targets

# ===============================
# UTILITY TARGETS
# ===============================

clean:
	@echo "🧹 Cleaning project..."
	rm -f $(SCRIPTS_DIR)/*/response.json
	rm -f $(SCRIPTS_DIR)/*/*/response.json
	cd $(BACKEND_DIR) && rm -rf cdk.out || true
	cd $(ADMIN_DIR) && rm -rf dist .next out node_modules/.cache || true
	cd $(MOBILE_DIR) && rm -rf dist .expo node_modules/.cache || true

status:
	@echo "📊 Kaleening Project Status:"
	@echo "=========================="
	@echo "  Environment: $(ENV)"
	@echo "  Current stack: $(STACK)"
	@echo "  Test source: $(SOURCE)"
	@echo "  Backend dir: $(BACKEND_DIR)"
	@echo "  Admin dir: $(ADMIN_DIR)"
	@echo "  Mobile dir: $(MOBILE_DIR)"
	@echo ""
	@echo "  Script directories:"
	@echo "    AWS scripts: $(AWS_SCRIPTS_DIR)"
	@echo "    Testing scripts: $(TESTING_SCRIPTS_DIR)"
	@echo "    Build scripts: $(BUILD_SCRIPTS_DIR)"
	@echo "    Utility scripts: $(UTILS_SCRIPTS_DIR)"
	@echo ""
	@echo "  Git status:"
	@git status --porcelain | head -5 || echo "    (Not a git repository)"
	@echo ""
	@echo "  AWS profile:"
	@aws sts get-caller-identity --query 'Arn' --output text 2>/dev/null || echo "    (AWS not configured)"

# ===============================
# PHONY TARGETS
# ===============================

.PHONY: help clean status