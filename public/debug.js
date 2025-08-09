// Debug function to test wallet update logic
const testWalletUpdate = () => {
    console.log('🧪 Testing wallet update logic...');
    
    // Get current data
    const transactions = JSON.parse(localStorage.getItem('expense-tracker-transactions') || '[]');
    const wallets = JSON.parse(localStorage.getItem('expense-tracker-wallets') || '[]');
    
    console.log('📊 Current state:');
    console.log('Transactions:', transactions.length);
    console.log('Wallets:', wallets.map(w => ({ name: w.name, balance: w.balance, id: w.id })));
    
    // Calculate what balance should be based on transactions
    const walletBalances = {};
    transactions.forEach(transaction => {
        if (transaction.walletId && transaction.walletId.trim() !== '') {
            if (!walletBalances[transaction.walletId]) {
                walletBalances[transaction.walletId] = 0;
            }
            const change = transaction.type === 'income' 
                ? transaction.amount 
                : -transaction.amount;
            walletBalances[transaction.walletId] += change;
        }
    });
    
    console.log('💰 Calculated balances from transactions:', walletBalances);
    
    // Compare with actual wallet balances
    wallets.forEach(wallet => {
        const calculatedBalance = walletBalances[wallet.id] || 0;
        const actualBalance = wallet.balance;
        const difference = actualBalance - calculatedBalance;
        
        console.log(`🔍 ${wallet.name}: actual=${actualBalance}, calculated=${calculatedBalance}, diff=${difference}`);
        
        if (Math.abs(difference) > 0.01) {
            console.warn(`❌ Wallet ${wallet.name} is out of sync!`);
        } else {
            console.log(`✅ Wallet ${wallet.name} is in sync`);
        }
    });
    
    return { wallets, transactions, walletBalances };
};

// Make it available globally for console testing
window.testWalletUpdate = testWalletUpdate;
