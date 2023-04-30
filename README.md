# Plans

## HTTP Requests

### GET Transaction IDs from a Block
### GET Raw Transaction based upon Transaction ID
#### Pay-to-Pubkey (P2PK)
#### Pay-to-Pubkey-Hash (P2PKH)
#### Pay-to-Script-Hash (P2SH)
#### Pay-to-Witness-Pubkey-Hash (P2WPKH)
#### Pay-to-Witness-Script-Hash (P2WSH)
#### Multisignature (Multisig)
#### Time-Locked Transactions
#### CoinJoin Transactions
#### P2TR Transactions


#### Does this need a limit because there are so many?
 - Applied a ratelimit for identification that uses the shared API key
   
#### Should a requirement be that you already have a transaction ID?



## UI
1. Homepage / intro - Conner to build, Events1 to design
2. Input UI (with a textbox) - Conner (Done)
3. Explanation UI pages
   - Transaction hash (Interactive UI) - Conner
   - Wallet ID (Interactive UI) - Conner
   - ...

## UI Components
1. AI chat / prompter component - Conner (Done)
2. Hex interactive decoder component
3. Interactive hex view
   - Container (default view) (IroncladDev)
     - span (IroncladDev)
   - Container (detail view)
     - breakdownPreview (IroncladDev)
     - hexBit - (IroncladDev)
       - tooltip (IroncladDev)
     - textColorRenderer (bit-json)


## TODO (High pri)
1. Mempool validity indicator
2. Backend (Nathan)
3. Frontend (Conner)

## Backend
1. Expose proxied API endpoints from mempool - Done by Nathan
2. Websocket requests to mempool - (considering, maybe not) - Conner
3. AI explanation endpoints - Conner (Done)
   - Explain transaction hash
   - Explain wallet ID
   - ...


