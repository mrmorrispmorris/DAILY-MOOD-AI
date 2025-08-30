import { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog-content'

export const metadata: Metadata = {
  title: 'Mental Health Blog - 20+ Expert Articles',
  description: 'Expert insights on mood tracking, mental wellness, and emotional health. Over 20 comprehensive articles dating back to 2023.'
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/" className="text-purple-600 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mental Health Blog
          </h1>
          <p className="text-xl text-gray-600">
            Expert insights, research, and practical guidance for your mental wellness journey. 
            <span className="font-semibold text-purple-600">{posts.length}+ comprehensive articles</span> dating back to 2023.
          </p>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.slug} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                {post.featured && (
                  <div className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full mb-3">
                    Featured
                  </div>
                )}
                
                <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                  {post.title.length > 60 ? post.title.substring(0, 60) + '...' : post.title}
                </h2>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {post.excerpt.length > 120 ? post.excerpt.substring(0, 120) + '...' : post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{new Date(post.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                  <span>{post.readTime}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <Link 
                  href={`/blog/${post.slug}`}
                  className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Read Article
                </Link>
              </div>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No blog posts found.</p>
          </div>
        )}
      </div>

      {/* Newsletter CTA */}
      <div className="mt-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
        <p className="text-white/90 mb-6">
          Get the latest mental health insights delivered to your inbox weekly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input 
            type="email" 
            placeholder="Your email address"
            className="flex-1 px-4 py-2 rounded-lg text-gray-900"
          />
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-lg"
          >
            Subscribe
          </Link>
        </div>
      </div>
    </div>
  )
}