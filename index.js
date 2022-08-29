import { readFileSync } from 'fs'
import { sourcecred } from 'sourcecred'
import { config } from 'dotenv'
config()

const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN || ''

const main = async () => {
  const scJson = JSON.parse(readFileSync('./sc.json'))

  const storage = new sourcecred.ledger.storage.WritableGithubStorage({
    apiToken: GITHUB_API_TOKEN,
    repo: 'sourcecred/makerdao-cred',
    branch: 'wallet-addition-aug-03',
  })
  const ledgerManager = new sourcecred.ledger.manager.LedgerManager({
    storage,
  })
  await ledgerManager.reloadLedger()
  const ledger = ledgerManager.ledger

  for (const { username, address } of scJson) {
    const account = ledger.accountByName(username)

    ledger.setPayoutAddress(
      account.identity.id, // user identity id
      address, // user wallet address
      '1', // Ethereum mainnet chain id
      '0x6B175474E89094C44Da98b954EedeAC495271d0F' // DAI token address
    )
  }

  const persistRes = await ledgerManager.persist()
  if (persistRes.error)
    console.log(
      `An error occurred when trying to commit the new ledger: ${persistRes.error}`
    )
}

main()
