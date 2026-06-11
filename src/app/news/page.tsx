import Link from 'next/link'

export const revalidate = 3600

async function getBlogPosts() {
  try {
    const res = await fetch(
      'https://blog.avsurge.com/feeds/posts/default?alt=rss&max-results=20',
      { next: { revalidate: 3600 } }
    )
    const xml = await res.text()

    // Parse items from RSS
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || []

    return items.map(item => {
      const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() || ''
      const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || ''
      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || ''
      const description = item.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim().slice(0, 160) || ''
      const category = item.match(/<category>([\s\S]*?)<\/category>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() || ''

      // Try to extract first image from content
      const mediaUrl = item.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1] ||
        item.match(/<enclosure[^>]+url="([^"]+)"/)?.[1] || null

      const date = pubDate ? new Date(pubDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      }) : ''

      return { title, link, date, description, category, mediaUrl }
    }).filter(p => p.title && p.link)
  } catch {
    return []
  }
}

export default async function NewsPage() {
  const posts = await getBlogPosts()

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phone news & reviews</h1>
          <p className="text-sm text-gray-400 mt-1">Latest from blog.avsurge.com</p>
        </div>
        <a href="https://blog.avsurge.com" target="_blank"
          className="text-sm text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition">
          Visit blog →
        </a>
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post, i) => (
            <a key={i} href={post.link} target="_blank" rel="noopener noreferrer"
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-sm transition group">

              {/* Image */}
              <div className="w-full h-44 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
                {post.mediaUrl
                  ? <img src={post.mediaUrl} alt={post.title} className="w-full h-full object-cover" />
                  : <span className="text-5xl">📱</span>
                }
              </div>

              <div className="p-4">
                {/* Tag + date */}
                <div className="flex items-center gap-2 mb-2">
                  {post.category && (
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{post.category}</span>
                  )}
                  {post.category && post.date && <span className="text-gray-300 text-xs">·</span>}
                  {post.date && <span className="text-xs text-gray-400">{post.date}</span>}
                </div>

                {/* Title */}
                <h2 className="text-sm font-bold text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition line-clamp-2">
                  {post.title}
                </h2>

                {/* Snippet */}
                {post.description && (
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{post.description}</p>
                )}

                <span className="text-xs font-semibold text-blue-600">Read more →</span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-24 text-center">
          <p className="text-4xl mb-4">📰</p>
          <p className="text-gray-500 font-medium mb-1">No posts yet</p>
          <p className="text-gray-400 text-sm mb-4">Publish your first post on Blogger to see it here</p>
          <a href="https://blog.avsurge.com" target="_blank"
            className="text-sm text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition">
            Go to Blogger →
          </a>
        </div>
      )}
    </main>
  )
}
