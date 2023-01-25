import { FC, useEffect, useState } from 'react'
import useWallet from '../hooks/StationWallet'
import { FilecoinNumber, BigNumber } from '@glif/filecoin-number'

import { ReactComponent as WalletIcon } from '../assets/img/icons/wallet.svg'
import WalletTransactionStatusWidget from './WalletTransactionStatusWidget'
import { FILTransactionProcessing } from '../typings'

interface WalletWidgetProps {
  onClick: () => void
}

const WalletWidget: FC<WalletWidgetProps> = ({ onClick }) => {
  const { walletBalance, currentTransaction, dismissCurrentTransaction } = useWallet()
  const [displayTransition, setDisplayTransaction] = useState<FILTransactionProcessing|undefined>(undefined)

  useEffect(() => {
    if (currentTransaction !== undefined) {
      setDisplayTransaction(currentTransaction)
    }
  }, [currentTransaction])

  return (
    <div className="cursor-pointer" onClick={() => { onClick(); dismissCurrentTransaction() }}>
      <div className='flex items-center '>
        <WalletIcon />
        <span className="text-right mx-3" title="wallet">
          <span className='font-bold'>
            {new FilecoinNumber(String(walletBalance), 'fil')
              .decimalPlaces(3, BigNumber.ROUND_DOWN)
              .toString()}
          </span>
          {' '}
          FIL
        </span>
        <button type="button" className="cursor-pointer" title="logout">
          <span className="text-primary underline underline-offset-8">Open Wallet</span>
        </button>
      </div>
      <div className={`transition duration-1000 ease-in-out opacity-0 ${currentTransaction ? 'opacity-100' : 'opacity-0'}`}
        onTransitionEnd={() => !currentTransaction && setDisplayTransaction(undefined)}>
        {displayTransition && <WalletTransactionStatusWidget currentTransaction={displayTransition} renderBackground={true} />}
      </div>
    </div>
  )
}

export default WalletWidget
