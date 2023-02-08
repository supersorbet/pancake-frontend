import IndividualNFT from 'views/Nft/market/Collection/IndividualNFTPage'
import { NextSeo } from 'next-seo'
import qs from 'qs'
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import { getCollection, getNftApi } from 'state/nftMarket/helpers'
import { NftToken } from 'state/nftMarket/types'
// eslint-disable-next-line camelcase
import { SWRConfig, unstable_serialize } from 'swr'
import { ASSET_CDN, DYNAMIC_OG_IMAGE } from 'config/constants/endpoints'

const IndividualNFTPage = ({ fallback = {} }: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <SWRConfig
      value={{
        fallback,
      }}
    >
      <IndividualNFT />
    </SWRConfig>
  )
}

IndividualNFTPage.Meta = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  if (props.collectionAddress && props.tokenId) {
    const nft = props.fallback?.[unstable_serialize(['nft', props.collectionAddress, props.tokenId])]?.[
      props.collectionAddress
    ]?.[props.tokenId] as NftToken

    if (nft) {
      const query = qs.stringify({
        image: nft.image,
        title: nft.name,
      })
      return (
        <NextSeo
          title={`${nft.name} - NFT`}
          openGraph={{
            images: [{ url: `${DYNAMIC_OG_IMAGE}/nft${query}` }, { url: `${ASSET_CDN}/web/og/nft.jpg` }],
          }}
        />
      )
    }
  }
  return null
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    fallback: true,
    paths: [],
  }
}

export const getStaticProps = (async ({ params }) => {
  const { collectionAddress, tokenId } = params

  if (typeof collectionAddress !== 'string' || typeof tokenId !== 'string') {
    return {
      notFound: true,
    }
  }

  const metadata = await getNftApi(collectionAddress, tokenId)
  const collection = await getCollection(collectionAddress)
  if (!metadata) {
    return {
      notFound: true,
      revalidate: 1,
    }
  }

  const nft: NftToken = {
    tokenId,
    collectionAddress,
    collectionName: metadata.collection.name,
    name: metadata.name,
    description: metadata.description,
    image: metadata.image,
    attributes: metadata.attributes,
  }

  return {
    props: {
      fallback: {
        [unstable_serialize(['nft', nft.collectionAddress, nft.tokenId])]: nft,
        ...(collection && {
          [unstable_serialize(['nftMarket', 'collections', collectionAddress.toLowerCase()])]: collection,
        }),
      },
      collectionAddress: nft.collectionAddress,
      tokenId: nft.tokenId,
    },
    revalidate: 60 * 60 * 6, // 6 hours
  }
}) satisfies GetStaticProps

export default IndividualNFTPage
