import { WrappedTokenInfo } from '@pancakeswap/token-lists'
import { DYNAMIC_OG_IMAGE } from 'config/constants/endpoints'
import { useAllTokens } from 'hooks/Tokens'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import qs from 'qs'
import { CHAIN_IDS } from 'utils/wagmi'
import Swap from '../views/Swap'
import { SwapFeaturesProvider } from '../views/Swap/SwapFeaturesContext'

const SwapPage = () => {
  return (
    <SwapFeaturesProvider>
      <Swap />
    </SwapFeaturesProvider>
  )
}

function SwapMeta() {
  const { query } = useRouter()
  console.log(query, 'query')
  if (
    typeof query.inputCurrency === 'string' &&
    typeof query.outputCurrency === 'string' &&
    query.inputCurrency !== query.outputCurrency
  ) {
    return <SwapMetaSEO inputCurrency={query.inputCurrency} outputCurrency={query.outputCurrency} />
  }

  return null
}

function SwapMetaSEO({ inputCurrency, outputCurrency }: { inputCurrency: string; outputCurrency: string }) {
  const native = useNativeCurrency()
  const tokens = useAllTokens()

  const input = tokens[inputCurrency]
  const output = tokens[outputCurrency]

  if (
    (input instanceof WrappedTokenInfo || native.symbol === inputCurrency) &&
    (output instanceof WrappedTokenInfo || native.symbol === outputCurrency)
  ) {
    const isInputNative = native.symbol === inputCurrency
    const isOutputNative = native.symbol === outputCurrency

    const query = qs.stringify(
      {
        inputSymbol: isInputNative ? native.symbol : tokens[inputCurrency].symbol,
        outputSymbol: isOutputNative ? native.symbol : tokens[outputCurrency].symbol,
        inputImage: isInputNative
          ? `https://pancakeswap.finance/images/chains/${native.chainId}.png`
          : (input as WrappedTokenInfo).logoURI,
        outputImage: isOutputNative
          ? `https://pancakeswap.finance/images/chains/${native.chainId}.png`
          : (output as WrappedTokenInfo).logoURI,
      },
      { addQueryPrefix: true },
    )

    return (
      <NextSeo
        openGraph={{
          images: [
            {
              url: `${DYNAMIC_OG_IMAGE}/swap${query}`,
            },
            // {
            //   url: `${ASSET_CDN}/web/og/swap.jpg`,
            // },
          ],
        }}
      />
    )
  }
}

SwapPage.Meta = SwapMeta

SwapPage.chains = CHAIN_IDS

export default SwapPage
