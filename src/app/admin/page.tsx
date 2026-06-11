import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 0

export default async function AdminPage() {
  const { data: phones } = await supabase
    .from('phones')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">{phones?.length || 0} phones in database</p>
        </div>
        <Link href="/admin/add-phone"
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
          + Add phone
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Brand</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {phones && phones.length > 0 ? phones.map((phone, i) => (
              <tr key={phone.id} className={`border-b border-gray-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-xl overflow-hidden flex-shrink-0">
                      {phone.image_url
                        ? <img src={phone.image_url} alt={phone.name} className="object-contain w-full h-full" />
                        : '📱'}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{phone.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">{phone.brand}</td>
                <td className="px-5 py-3 text-sm text-gray-500">
                  {phone.price_inr ? `₹${phone.price_inr.toLocaleString('en-IN')}` : '—'}
                </td>
                <td className="px-5 py-3 text-xs text-gray-400 font-mono">{phone.slug}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/phones/${phone.slug}`}
                      className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                      View
                    </Link>
                    <Link href={`/admin/edit-phone/${phone.slug}`}
                      className="text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
                      Edit
                    </Link>
                    <Link href={`/admin/delete-phone/${phone.slug}`}
                      className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                      Delete
                    </Link>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-sm text-gray-400">
                  No phones yet. <Link href="/admin/add-phone" className="text-blue-600 hover:underline">Add one →</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
