'use client'

import { useServerInsertedHTML } from 'next/navigation'
import { useState } from 'react'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'

// This ensures that Emotion styles are inserted in the correct order
export default function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const [cache] = useState(() => {
    const cache = createCache({ key: 'css', prepend: true })
    cache.compat = true
    return cache
  })

  useServerInsertedHTML(() => {
    const names = Object.keys(cache.inserted)
    if (names.length === 0) {
      return null
    }
    const styles = Object.values(cache.inserted).join(' ')
    const emotionKey = `${cache.key} ${names.join(' ')}`
    return (
      <style
        data-emotion={emotionKey}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    )
  })

  return <CacheProvider value={cache}>{children}</CacheProvider>
}
