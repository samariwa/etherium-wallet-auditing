import subprocess
import shlex

def run_eth_wallet_command(args):
    """Run an eth-wallet CLI command and return the output as string."""
    cmd = f"eth-wallet {args}"
    try:
        result = subprocess.run(shlex.split(cmd), capture_output=True, text=True, check=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        return e.stderr or str(e)

# Get wallet info (address, pub key)
def get_wallet_info():
    return run_eth_wallet_command("get-wallet")

# Get ETH or token balance
def get_wallet_balance(token=None):
    if token:
        return run_eth_wallet_command(f"get-balance --token {token}")
    return run_eth_wallet_command("get-balance")

# Send ETH transaction (interactive, will prompt for input)
def send_eth_transaction():
    return run_eth_wallet_command("send-transaction")

# Add new ERC20 token (interactive)
def add_token():
    return run_eth_wallet_command("add-token")

# List all added tokens
def list_tokens():
    return run_eth_wallet_command("list-tokens")

# Show connected network
def get_network():
    return run_eth_wallet_command("network")

# Reveal wallet master private key (interactive)
def reveal_seed():
    return run_eth_wallet_command("reveal-seed")

# Restore wallet (interactive)
def restore_wallet():
    return run_eth_wallet_command("restore-wallet")

print(get_wallet_balance())