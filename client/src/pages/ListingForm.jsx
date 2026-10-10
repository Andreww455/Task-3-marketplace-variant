import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// TODO: build the Sell an Item page — see README.md "Your task".
// This page is already routed at /listings/new (sell) and /listings/:id (edit),
// and both routes are wrapped in <ProtectedRoute>.

const defaults = { title: '', description: '', price: 0, category: 'other', condition: 'used', status: 'active' }

export default function ListingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // TODO (edit mode): when there is an `id`, load the listing and fill the form.
  useEffect(() => {
    if (!id) return
    api.get(`/listings/${id}`)
      .then(({ data }) => {
        const { title, price, category, condition, status, description } = data.listing
        setForm({ title, price, category, condition, status, description: description || '' })
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load listing'))
  }, [id])

  // TODO: update `form` when an input changes (price should be a number).
  function onChange(e) {
    const { name, value, type } = e.target
    setForm((f) => ({ ...f, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value }))
  }

  // TODO: POST a new listing, or PATCH the existing one when editing,
  // then go back to /listings. Show the server's error message on failure.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const { title, description, price, category, condition, status } = form
      if (id) {
        await api.patch(`/listings/${id}`, { title, description, price, category, condition, status })
      } else {
        await api.post('/listings', { title, description, price, category, condition })
      }
      nav('/listings')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Listing</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="input" name="title" placeholder="Title (e.g. Calculus textbook)" value={form.title} onChange={onChange} required />
        <input className="input" name="price" type="number" min="0" step="any" placeholder="Price" value={form.price} onChange={onChange} required />
        <select className="input" name="category" value={form.category} onChange={onChange}>
          {['textbooks', 'electronics', 'furniture', 'clothing', 'other'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className="input" name="condition" value={form.condition} onChange={onChange}>
          {['new', 'like-new', 'used', 'worn'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {id && (
          <select className="input" name="status" value={form.status} onChange={onChange}>
            <option value="active">active</option>
            <option value="sold">sold</option>
          </select>
        )}
        <textarea className="input" name="description" rows="4" placeholder="Description (optional)" value={form.description} onChange={onChange} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
