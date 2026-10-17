#!/bin/bash

# GRAW AI - Shopify App Client Deployment Script
# This script automates the deployment of a new Shopify app for a client
# Usage: ./deploy-new-client.sh <client-name> <secret_pixel_activation_key>

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if required tools are installed
check_requirements() {
    print_status "Checking required tools..."
    
    local missing_tools=()
    
    if ! command -v git &> /dev/null; then
        missing_tools+=("git")
    fi
    
    if ! command -v shopify &> /dev/null; then
        missing_tools+=("shopify")
    fi
    
    if ! command -v flyctl &> /dev/null; then
        missing_tools+=("flyctl")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_error "Please install the missing tools and try again."
        exit 1
    fi
    
    print_success "All required tools are installed"
}

# Function to validate client name
validate_client_name() {
    local client_name="$1"
    
    if [[ -z "$client_name" ]]; then
        print_error "Client name is required"
        echo "Usage: $0 <client-name>"
        exit 1
    fi
    
    # Check if client name contains only valid characters (alphanumeric, hyphens, underscores)
    if [[ ! "$client_name" =~ ^[a-zA-Z0-9_-]+$ ]]; then
        print_error "Client name can only contain letters, numbers, hyphens, and underscores"
        exit 1
    fi
    
    print_success "Client name '$client_name' is valid"
}

# Function to create temporary directory for this deployment
create_temp_dir() {
    TEMP_DIR=$(mktemp -d)
    print_status "Created temporary directory: $TEMP_DIR"
    
    # Cleanup function
    cleanup() {
        print_status "Cleaning up temporary files..."
        rm -rf "$TEMP_DIR"
    }
    trap cleanup EXIT
}

# Function to clone the standardized repo
clone_repo() {
    local client_name="$1"
    local repo_url="git@github.com:erebor-ai/graw-ai-chatbot-vilros-v2.git"
    local target_dir="graw-ai-chatbot-$client_name"
    
    print_status "Step 1: Cloning standardized repo for client '$client_name'..."
    
    if [ -d "$target_dir" ]; then
        print_error "Directory '$target_dir' already exists. Please remove it first or choose a different client name."
        exit 1
    fi
    
    git clone "$repo_url" "$target_dir"
    cd "$target_dir"
    
    # Remove the original git remote and reinitialize
    rm -rf .git
    git init
    
    print_success "Repository cloned and reinitialized for client '$client_name'"
}

# Function to install dependencies
install_dependencies() {
    local client_name="$1"
    print_status "Step 1.5: Installing project dependencies..."
    npm install --legacy-peer-deps
    print_success "Dependencies installed successfully"
}

# Function to backup config files
prepare_config_files() {
    local client_name="$1"
    local app_name="graw-ai-chatbot-$client_name"
    local fly_url="https://$app_name.fly.dev"

    print_status "Step 2: Preparing configuration files..."
    
    if [ -f "shopify.app.toml" ]; then
        cp "shopify.app.toml" "shopify.app.toml.backup"
        print_success "Backed up shopify.app.toml"
    fi
    
    if [ -f "fly.toml" ]; then
        cp "fly.toml" "fly.toml.backup"
        # Patch the fly.toml immediately so 'fly launch' detects it
        sed -i '' "s/app = .*/app = '$app_name'/" fly.toml
        sed -i '' "s|SHOPIFY_APP_URL = .*|SHOPIFY_APP_URL = \"$fly_url\"|" fly.toml
        print_success "Pre-patched fly.toml for $app_name"
    fi
}


# Function to initialize Fly app
init_fly_app() {
    local client_name="$1"
    local app_name="graw-ai-chatbot-$client_name"
    
    print_status "Step 4: Initializing Fly app '$app_name'..."

    # Bypass the interactive 'fly launch' which hangs on Shopify detection.
    # We create the app entry directly using 'apps create'.
    if ! flyctl apps list | grep -q "$app_name"; then
        flyctl apps create "$app_name" --org personal
        print_success "Fly app '$app_name' created"
    else
        print_warning "Fly app '$app_name' already exists"
    fi
}

# Function to update fly.toml configuration
update_fly_toml() {
    local client_name="$1"
    local app_name="graw-ai-chatbot-$client_name"
    
    print_status "Step 5: Updating fly.toml configuration..."
    
    # Replace SCOPES if it exists, or add it to [env]
    # We use 'read_products,write_pixels,read_pixels,read_customer_events' to match your shopify.app.toml
    local scopes="read_products,write_pixels,read_pixels,read_customer_events"
    sed -i '' "s/SCOPES = .*/SCOPES = \"$scopes\"/" fly.toml

    # Ensure PRIMARY_REGION is set
    sed -i '' "s/PRIMARY_REGION = .*/PRIMARY_REGION = \"lhr\"/" fly.toml
    
    print_success "fly.toml updated with environment variables"
}

# Function to update shopify.app.toml configuration
update_shopify_app_toml() {
    local client_name="$1"
    local app_name="graw-ai-chatbot-$client_name"
    local fly_url="https://graw-ai-chatbot-$client_name.fly.dev"
    
    print_status "Step 6: Updating shopify.app.toml configuration..."
    
    # 1. Extract the new client_id
    local client_id=$(grep "^client_id" shopify.app.toml | cut -d'"' -f2 | tr -d '"' | tr -d "'")
    
    if [[ -z "$client_id" || ! -f "shopify.app.toml.backup" ]]; then
        print_error "Missing client_id or shopify.app.toml.backup"
        exit 1
    fi

    # CRITICAL FIX: Update the API Key in fly.toml to match the new shopify client_id
    # This prevents the authentication redirect loop
    sed -i '' "s/SHOPIFY_API_KEY = .*/SHOPIFY_API_KEY = \"$client_id\"/" fly.toml

    local display_name="GRAW AI - ($client_name)"
    local truncated_name="${display_name:0:29}"

    # 2. Overwrite and reconstruct using the template (backup) as the base
    cat > shopify.app.toml << EOF
# Learn more about configuring your app at https://shopify.dev/docs/apps/tools/cli/configuration

client_id = "$client_id"
application_url = "$fly_url"
embedded = true
name = "$truncated_name"
handle = "$app_name"

EOF

    # 3. Append everything from the backup starting from the [build] section
    # and update URLs/handles along the way
    sed -n '/\[build\]/,$p' shopify.app.toml.backup | \
    sed -E "s#https://[A-Za-z0-9.-]+\.fly\.dev#$fly_url#g" >> shopify.app.toml

    # Fail loudly if any URL still points at another app's host.
    if grep -o 'https://[A-Za-z0-9.-]*\.fly\.dev' shopify.app.toml | grep -qvx "$fly_url"; then
        print_error "shopify.app.toml still references a different Fly host. Aborting before deploy."
        exit 1
    fi

    print_success "shopify.app.toml reconstructed cleanly"
}

# Function to redeploy Shopify app with new configuration
redeploy_shopify_app() {
    local client_name="$1"
    
    print_status "Step 7: Redeploying Shopify app with updated configuration..."
    
    # Explicitly use the file we prepared to ignore any custom naming remembered by the CLI
    shopify app deploy --config shopify.app.toml --force --no-color
    
    print_success "Shopify app redeployed successfully"
}

# Function to set required secrets
set_fly_secrets() {
    local client_name="$1"
    local activation_secret="$2"
    local app_name="graw-ai-chatbot-$client_name"
    
    print_status "Step 8: Setting required secrets..."

    # Extract the secret directly from the env show output to avoid file system issues
    local shopify_secret=$(shopify app env show --config shopify.app.toml --no-color | grep SHOPIFY_API_SECRET | sed 's/.*=//' | tr -d '"' | tr -d "'")

    if [[ -z "$shopify_secret" ]]; then
        print_error "Could not retrieve SHOPIFY_API_SECRET. Ensure 'shopify app config link' completed successfully."
        exit 1
    fi    
    
    # Set the required secrets based on current LiteFS + Voiceflow architecture
    flyctl secrets set --app "$app_name" \
        SHOPIFY_API_SECRET="$shopify_secret" \
        DATABASE_URL="file:/litefs/app.db" \
        REMOTE_ACTIVATE_SECRET="$activation_secret"

    # Provision exactly two LiteFS volumes for high availability
    if ! flyctl volumes list --app "$app_name" | grep -q "data"; then
        print_status "Creating 2 Fly volumes for LiteFS..."
        flyctl volumes create data --size 1 --region lhr --app "$app_name" --yes
        flyctl volumes create data --size 1 --region lhr --app "$app_name" --yes
    fi

    # Attach Consul cluster for LiteFS leadership (CRITICAL)
    print_status "Attaching Consul for LiteFS..."
    # FIXED: Removed the invalid '--yes' flag. 
    # This command creates the FLY_CONSUL_URL secret.
    if flyctl consul attach --app "$app_name"; then
        print_success "Consul attached successfully"
    else
        print_warning "Consul attachment failed. LiteFS will not start until you run 'fly consul attach' manually."
    fi
}

# Function to deploy to Fly
deploy_to_fly() {
    local client_name="$1"
    
    print_status "Step 9: Deploying to Fly.io..."
    
    flyctl deploy --app "graw-ai-chatbot-$client_name"

    print_status "Step 10: Scaling to 2 machines for high availability..."
    flyctl scale count 2 --app "graw-ai-chatbot-$client_name" --yes
    
    print_success "Successfully deployed and scaled to Fly.io"
}

# Function to show deployment summary
show_summary() {
    local client_name="$1"
    local activation_secret="$2"
    local app_name="graw-ai-chatbot-$client_name"
    local fly_url="https://graw-ai-chatbot-$client_name.fly.dev"
    local activation_url="$fly_url/api/remote-activate?shop=[SHOP].myshopify.com&secret=$activation_secret"
    
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "=== DEPLOYMENT SUMMARY ==="
    echo "Client Name: $client_name"
    echo "App Name: $app_name"
    echo "Shopify App URL: $fly_url"
    echo ""
    echo "=== NEXT STEPS ==="
    echo "1. OPEN app/config.server.ts and update VOICEFLOW_CONFIG IDs."
    echo "2. OPEN voiceflow_extensions.js and update OrderNumber length."
    echo "3. RUN 'fly deploy' again to apply code changes."
    echo "4. Create the App Embed in Partner Dashboard using $fly_url."
    echo "5. Install the app on the client's store."
    echo "6. Activate Web Pixel remotely using:"
    echo "   $activation_url"
    echo ""
    echo "=== FILES CREATED/MODIFIED ==="
    echo "- shopify.app.toml (updated for $client_name)"
    echo "- fly.toml (updated for $client_name)"
    echo "- shopify.app.toml.backup (backup of original)"
    echo "- fly.toml.backup (backup of original)"
    echo ""
}

# Main deployment function
main() {
    local client_name="$1"
    local manual_secret="$2"
    
    print_status "Starting deployment for client: $client_name"
    print_status "================================================"
    
    # Pre-deployment checks
    check_requirements
    validate_client_name "$client_name"
    create_temp_dir
    
    # FIXED: Use the provided secret if available, otherwise generate a random one
    local activation_secret=${manual_secret:-$(openssl rand -hex 12)}

    # Execute deployment steps
    clone_repo "$client_name"
    install_dependencies "$client_name"
    prepare_config_files "$client_name"
    
    # Step 3: Shopify creation (interactive)
    shopify app config link
    
    # CRITICAL: If the user gave a custom config name, rename it to shopify.app.toml
    # This prevents the "stuck" behavior and allows Fly to find the config.
    if [ -f "shopify.app.$client_name.toml" ]; then
        mv "shopify.app.$client_name.toml" "shopify.app.toml"
    elif ls shopify.app.*.toml 1> /dev/null 2>&1; then
        mv shopify.app.*.toml shopify.app.toml
    fi

    # Step 4: Fly initialization
    init_fly_app "$client_name"
    update_shopify_app_toml "$client_name"
    redeploy_shopify_app "$client_name"
    set_fly_secrets "$client_name" "$activation_secret"
    deploy_to_fly "$client_name"
    
    # Show summary
    show_summary "$client_name" "$activation_secret"
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi