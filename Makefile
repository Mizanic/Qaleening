# ===============================
# Kaleening Project Makefile
# ===============================

PROJECT_NAME ?= Qaleening


# --- Core Configuration ---

STACK ?= --all
FULL_STACK_NAME = $(if $(filter --all,$(STACK)),$(STACK),SnapNews-$(STACK)Stack)
ENV ?= dev

SCRIPTS_DIR := .scripts
AWS_DIR := aws
MOBILE_DIR := mobile

# ===============================
# MAIN HELP SYSTEM
# ===============================

help:
	@echo "================== $(PROJECT_NAME) ==================="
	@echo "\nUsage: make [target] [VAR=value]\n"
	@echo "Available commands:"
	@echo "  make help        Show this help message"
	@echo "\n================== INFRA TARGETS ===================\n"
	@echo "  deploy         Deploy stack(s) [STACK=name]"
	@echo "  destroy        Destroy stack(s) (with confirmation)"
	@echo "  synth          Generate CloudFormation templates"
	@echo "  validate       Validate CDK application" 
	@echo "\n================== MOBILE TARGETS ===================\n"
	@echo "  mobile-dev     Start mobile dev server"
	@echo "  mobile-build   Build mobile app"

# ===============================
# PROJECT TARGETS
# ===============================
init:
	@echo "Initializing project..."
	@cd $(AWS_DIR) && npm install
	@cd $(MOBILE_DIR) && npm install


# ===============================
# INFRA TARGETS
# ===============================

deploy:
	@echo "🚀 Deploying stack(s): [$(FULL_STACK_NAME)]"
	@cd $(AWS_DIR) && cdk deploy $(FULL_STACK_NAME) --require-approval never
	
destroy:
	@echo "💥 Destroying stack(s): [$(FULL_STACK_NAME)]"
	@cd $(AWS_DIR) && cdk destroy $(FULL_STACK_NAME) --require-approval never


synth:
	@echo "🔨 Generating CloudFormation templates..."
	@cd $(AWS_DIR) && cdk synth $(FULL_STACK_NAME)

validate:
	@echo "🔍 Validating CDK application..."
	@cd $(AWS_DIR) && cdk doctor

.PHONY: help deploy destroy synth validate


# ===============================
# MOBILE TARGETS
# ===============================

mobile-dev:
	@echo "📱 Starting mobile dev server..."
	@./$(SCRIPTS_DIR)/$(MOBILE_DIR)/mobile-dev.sh

mobile-build:
	@echo "🔨 Building mobile app..."
	@./$(SCRIPTS_DIR)/$(MOBILE_DIR)/mobile-build.sh


