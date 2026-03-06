#!/bin/bash
# Get the project name from config.json file, remove spaces, and make lowercase

source "$(dirname "$0")/../common.sh"
show_script_header "Create S3 Bucket" "Create the S3 bucket"
setup_cleanup


# Compute the MD5 hash of the project name and add project name to the end
BUCKET_NAME="$(echo -n $PROJECT_NAME | md5sum | cut -d ' ' -f 1)-$(echo $PROJECT_NAME | tr '[:upper:]' '[:lower:]')"

# Check if the bucket already exists
if aws s3 ls "s3://$BUCKET_NAME" >/dev/null 2>&1; then
    log_warning "Bucket $BUCKET_NAME already exists"
    exit 0
fi

# Create the bucket
log_info "Creating bucket $BUCKET_NAME"
aws s3 mb s3://$BUCKET_NAME --region us-east-1

# Add tags to the bucket
log_info "Adding tags to the bucket"
aws s3api put-bucket-tagging \
    --bucket "$BUCKET_NAME" \
    --tagging '{"TagSet":[{"Key":"Project","Value":'\"$PROJECT_NAME\"'}]}'

log_success "S3 bucket created successfully"