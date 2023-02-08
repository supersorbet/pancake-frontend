import { useIsomorphicEffect } from '@pancakeswap/uikit'
import { PageMeta } from 'components/Layout/Page'
import { DYNAMIC_OG_IMAGE } from 'config/constants/endpoints'
import { NextSeo } from 'next-seo'
import qs from 'qs'
import { useState } from 'react'
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
  const [query, setQuery] = useState<string>('')

  useIsomorphicEffect(() => {
    const params = new URL(window.location.href).searchParams
    const inputCurrency = params.get('inputCurrency')
    const outputCurrency = params.get('outputCurrency')
    // const chain = params.get('chain')

    if (inputCurrency && outputCurrency) {
      const inputSymbol = inputCurrency
      const outputSymbol = outputCurrency

      const query_ = qs.stringify(
        {
          inputSymbol,
          outputSymbol,
        },
        { addQueryPrefix: true },
      )

      setQuery(query_)
    }
  }, [])

  if (query) {
    return <SwapMetaSEO query={query} />
  }

  return <PageMeta />
}

function SwapMetaSEO({ query }: { query: string }) {
  return (
    <NextSeo
      openGraph={{
        images: [
          {
            url: `${DYNAMIC_OG_IMAGE}/swap${query}`,
          },
        ],
      }}
    />
  )
}

SwapPage.Meta = SwapMeta

SwapPage.chains = CHAIN_IDS

export default SwapPage
