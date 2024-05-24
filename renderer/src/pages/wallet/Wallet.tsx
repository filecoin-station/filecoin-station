import useWallet from 'src/hooks/StationWallet'
import { formatFilValue, openExplorerLink } from 'src/lib/utils'
import TransactionHistory from './TransactionHistory'
import PageShell from 'src/components/PageShell'
import BorderedBox from 'src/components/BorderedBox'
import Text from 'src/components/Text'
import Address from 'src/components/Address'
import LinkOut from 'src/assets/img/icons/link-out.svg?react'

const Wallet = () => {
  const {
    walletBalance,
    stationAddress,
    stationAddress0x,
    walletTransactions
  } = useWallet()

  return (
    <div className='w-full flex'>
        <PageShell>
            <section className='flex flex-col gap-5 h-full mb-9'>
                <BorderedBox className='p-5 flex flex-col gap-2'>
                    <Text font='mono' size='3xs' color='primary' uppercase>
                        &#47;&#47; Station wallet balance ... :
                    </Text>
                    <Text font='mono' size='s'>{formatFilValue(walletBalance)}{' '}FIL</Text>
                </BorderedBox>
                <BorderedBox className='p-5 flex flex-col gap-2'>
                    <Text font='mono' size='3xs' color='primary' uppercase>&#47;&#47; Station address ... :</Text>
                    <div className='flex gap-5 items-center'>
                        <Address address={stationAddress} />
                        <Address address={stationAddress0x} />
                        <button
                            type='button'
                            className='text-primary ml-auto focus:outline-slate-400 w-5 h-5'
                            onClick={() => openExplorerLink(stationAddress)}
                        >
                            <LinkOut />
                        </button>
                    </div>
                </BorderedBox>
                <div className='flex-1 flex flex-col'>
                    <BorderedBox className='p-5 flex flex-col gap-2' isGrouped>
                        <Text font='mono' size='3xs' color='primary' uppercase>
                            &#47;&#47; Transaction history ... :
                        </Text>
                    </BorderedBox>
                    <BorderedBox className='p-5 flex flex-col gap-2 flex-1' isGrouped>
                        <TransactionHistory walletTransactions={walletTransactions || []}/>
                    </BorderedBox>
                </div>
            </section>
        </PageShell>
        <section className='w-1/2 bg-black h-screen'>
        </section>
    </div>
  )
}

export default Wallet
