export const revalidate = 0

export const metadata = {
  title: 'Tech News & Reviews | AVSurge',
  description: 'Latest smartphone, tablet and laptop news, reviews and updates from India and around the world.',
  alternates: { canonical: 'https://avsurge.com/news' },
}



interface Post {
  title: string
  link: string
  date: string
  description: string
  categories: string[]
  mediaUrl: string | null
}

async function getBlogPosts(): Promise<Post[]> {
  try {
    const res = await fetch(
      'https://blog.avsurge.com/feeds/posts/default?alt=rss&max-results=50',
      { cache: 'no-store' }
    )
    const xml = await res.text()
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || []

    return items.map(item => {
      const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]
        ?.replace(/<!\[CDATA\[|\]\]>/g, '')
        ?.replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"')
        ?.trim() || ''

      const link = item.match(/<link>([^<]+)<\/link>/)?.[1]?.trim() || ''
      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || ''

      const description = item.match(/<description>([\s\S]*?)<\/description>/)?.[1]
        ?.replace(/<!\[CDATA\[|\]\]>/g, '')
        ?.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
        ?.replace(/<[^>]+>/g, '')
        ?.replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
        ?.trim().slice(0, 180) || ''

      // Get all categories
      const categoryMatches = item.match(/<category[^>]*>([^<]+)<\/category>/g) || []
      const categories = categoryMatches
        .map(m => m.match(/<category[^>]*>([^<]+)<\/category>/)?.[1]?.trim() || '')
        .filter(Boolean)

      const mediaUrl = item.match(/<media:content[^>]+url="([^"]+)"/)?.[1] ||
        item.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1] || null

      const date = pubDate ? new Date(pubDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      }) : ''

      return { title, link, date, description, categories, mediaUrl }
    }).filter(p => p.title && p.link)
  } catch (e) {
    console.error('RSS error:', e)
    return []
  }
}

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams
  const activeCategory = params?.category || ''
  const posts = await getBlogPosts()

  // Get all unique categories
  const allCategories = [...new Set(posts.flatMap(p => p.categories))].sort()

  // Filter by category
  const filtered = activeCategory
    ? posts.filter(p => p.categories.includes(activeCategory))
    : posts

  // Featured post (first one)
  const featured = filtered[0]
  const rest = filtered.slice(1)

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phone news & reviews</h1>
          <p className="text-sm text-gray-400 mt-1">Latest from blog.avsurge.com</p>
        </div>
        <a href="https://blog.avsurge.com" target="_blank"
          className="text-sm text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition">
          Visit blog →
        </a>
      </div>

      {/* Category filters */}
      {allCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <a href="/news"
            className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${!activeCategory ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
            All
          </a>
          {allCategories.map(cat => (
            <a key={cat} href={`/news?category=${encodeURIComponent(cat)}`}
              className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${activeCategory === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
              {cat}
            </a>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-24 text-center">
          <p className="text-4xl mb-4">📰</p>
          <p className="text-gray-500 font-medium mb-1">No posts in this category</p>
          <a href="/news" className="text-sm text-blue-600 hover:underline">View all posts →</a>
        </div>
      ) : (
        <>
          {/* Featured post */}
          {featured && (
            <a href={featured.link} target="_blank" rel="noopener noreferrer"
              className="block bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-md transition group mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="h-56 md:h-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center min-h-48">
                  {featured.mediaUrl
                    ? <img src={featured.mediaUrl} alt={featured.title} className="object-cover w-full h-full" />
                    : <span className="text-8xl">📱</span>}
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded-full font-medium">Featured</span>
                    {featured.categories[0] && (
                      <span className="text-xs text-blue-600 font-semibold uppercase tracking-wide">{featured.categories[0]}</span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 leading-tight mb-3 group-hover:text-blue-600 transition">
                    {featured.title}
                  </h2>
                  {featured.description && (
                    <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">{featured.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{featured.date}</span>
                    <span className="text-sm font-semibold text-blue-600">Read more →</span>
                  </div>
                </div>
              </div>
            </a>
          )}

          {/* Rest of posts */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((post, i) => (
                <a key={i} href={post.link} target="_blank" rel="noopener noreferrer"
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-sm transition group card-hover">
                  <div className="w-full h-40 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
                    {post.mediaUrl
                      ? <img src={post.mediaUrl} alt={post.title} className="object-cover w-full h-full" />
                      : <span className="text-5xl">📱</span>}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {post.categories.slice(0, 2).map(cat => (
                        <span key={cat} className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{cat}</span>
                      ))}
                      {post.date && <span className="text-xs text-gray-400 ml-auto">{post.date}</span>}
                    </div>
                    <h2 className="text-sm font-bold text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition line-clamp-2">
                      {post.title}
                    </h2>
                    {post.description && (
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{post.description}</p>
                    )}
                    <span className="text-xs font-semibold text-blue-600">Read more →</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
