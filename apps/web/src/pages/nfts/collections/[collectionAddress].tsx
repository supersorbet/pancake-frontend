import { ASSET_CDN, DYNAMIC_OG_IMAGE } from 'config/constants/endpoints'
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import { NextSeo } from 'next-seo'
import qs from 'qs'
import { getCollection } from 'state/nftMarket/helpers'
// eslint-disable-next-line camelcase
import { SWRConfig, unstable_serialize } from 'swr'
import CollectionPageRouter from 'views/Nft/market/Collection/CollectionPageRouter'

const CollectionPage = ({ fallback = {} }: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <SWRConfig
      value={{
        fallback,
      }}
    >
      <CollectionPageRouter />
    </SWRConfig>
  )
}

CollectionPage.Meta = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  if (props.collectionAddress) {
    const collection =
      props.fallback?.[unstable_serialize(['nftMarket', 'collections', props.collectionAddress.toLowerCase()])]?.[
        props.collectionAddress
      ]
    if (collection) {
      const query = qs.stringify(
        {
          title: collection.name,
          collectionId: props.collectionAddress,
          volume: `${collection.totalVolumeBNB} BNB`,
        },
        { addQueryPrefix: true },
      )
      return (
        <NextSeo
          openGraph={{
            images: [{ url: `${DYNAMIC_OG_IMAGE}/nft-collection${query}` }, { url: `${ASSET_CDN}/web/og/nft.jpg` }],
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
  const { collectionAddress } = params
  if (typeof collectionAddress !== 'string') {
    return {
      notFound: true,
    }
  }

  try {
    const collectionData = await getCollection(collectionAddress)

    if (collectionData) {
      return {
        props: {
          fallback: {
            [unstable_serialize(['nftMarket', 'collections', collectionAddress.toLowerCase()])]: { ...collectionData },
          },
          collectionAddress,
        },
        revalidate: 60 * 60 * 6, // 6 hours
      }
    }
    return {
      notFound: true,
      revalidate: 60,
    }
  } catch (error) {
    return {
      notFound: true,
      revalidate: 60,
    }
  }
}) satisfies GetStaticProps

export default CollectionPage
