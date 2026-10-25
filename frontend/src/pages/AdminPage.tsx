import { FormEvent, useEffect, useState } from 'react'
import axios from 'axios'
import { useAppContext } from '../App'
import { adminPricesApi, authApi, productsApi, storesApi, PriceRecord } from '../api/client'
import type { Product, Store } from '../types'

const today = () => new Date().toLocaleDateString('sv-SE')
const message = (e: unknown) => axios.isAxiosError(e)
  ? e.response?.data?.error || (e.response?.data?.errors ? 'Проверьте цену и дату: цена должна быть больше нуля, дата — не позже сегодняшней.' : 'Не удалось выполнить запрос. Попробуйте ещё раз.')
  : 'Не удалось выполнить запрос.'

export default function AdminPage() {
  const { selectedCity } = useAppContext()
  const [user, setUser] = useState<{ username: string | null; roles: string[] } | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [productId, setProductId] = useState(0)
  const [storeId, setStoreId] = useState(0)
  const [rows, setRows] = useState<PriceRecord[]>([])
  const [price, setPrice] = useState('')
  const [date, setDate] = useState(today())
  const [editId, setEditId] = useState<number>()
  const [deleteId, setDeleteId] = useState<number>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const isAdmin = user?.roles.includes('ADMIN')

  useEffect(() => { authApi.me().then(r => setUser(r.data)).catch(e => { setError(message(e)); setUser({ username: null, roles: [] }) }) }, [])
  useEffect(() => {
    if (!isAdmin || !selectedCity) return
    let active = true
    setStoreId(0); setRows([])
    Promise.all([productsApi.getAll(), storesApi.getAll(selectedCity.id)]).then(([p, s]) => {
      if (!active) return
      setProducts(p.data); setStores(s.data)
      setProductId(prev => prev || p.data[0]?.id || 0); setStoreId(s.data[0]?.id || 0)
    }).catch(e => { if (active) setError(message(e)) })
    return () => { active = false }
  }, [isAdmin, selectedCity])
  useEffect(() => {
    setEditId(undefined); setDeleteId(undefined); setRows([]); setPrice(''); setDate(today()); setNotice('')
    if (!isAdmin || !productId || !storeId) return
    let active = true
    adminPricesApi.list(productId, storeId).then(r => { if (active) setRows(r.data) })
      .catch(e => { if (active) setError(message(e)) })
    return () => { active = false }
  }, [isAdmin, productId, storeId])

  async function login(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    try { await authApi.login(username, password); setPassword(''); setUser((await authApi.me()).data) }
    catch (e) { setError(message(e)) } finally { setBusy(false) }
  }
  async function save(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setNotice('')
    try {
      await adminPricesApi.save({ productId, storeId, price: Number(price), priceDate: date }, editId)
      setRows((await adminPricesApi.list(productId, storeId)).data)
      setNotice(editId ? 'Цена обновлена.' : 'Цена добавлена.'); setEditId(undefined); setPrice(''); setDate(today())
    } catch (e) { setError(message(e)) } finally { setBusy(false) }
  }
  async function remove() {
    if (!deleteId) return
    setBusy(true); setError('')
    try { await adminPricesApi.remove(deleteId); setRows((await adminPricesApi.list(productId, storeId)).data); setDeleteId(undefined); setNotice('Запись удалена.') }
    catch (e) { setError(message(e)) } finally { setBusy(false) }
  }
  async function logout() {
    setBusy(true); setError('')
    try { await authApi.logout(); setUser({ username: null, roles: [] }); setRows([]); setNotice('') }
    catch (e) { setError(message(e)) } finally { setBusy(false) }
  }
  const button = 'rounded-lg bg-emerald-800 px-5 py-2.5 font-medium text-white hover:bg-emerald-900 disabled:opacity-50'
  return <div className="max-w-5xl mx-auto">
    <div className="mb-7 border-b border-slate-200 pb-5 flex flex-wrap gap-4 justify-between items-start">
      <div><p className="text-xs uppercase tracking-widest text-emerald-800 mb-2">Smart Basket · Управление</p>
        <h1 className="text-3xl font-bold text-slate-900">Цены в магазинах</h1>
        <p className="mt-2 text-slate-600">Обновляйте цены, сохраняя историю изменений по датам.</p></div>
      {user?.username && <button disabled={busy} onClick={logout} className="rounded-lg border border-slate-400 px-4 py-2">Выйти · {user.username}</button>}
    </div>
    {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}
    {notice && <p role="status" className="mb-5 rounded-lg bg-emerald-50 p-4 text-emerald-900">{notice}</p>}
    {!user ? <p role="status">Проверяем вход…</p> : !user.username ?
      <form onSubmit={login} className="max-w-md rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="text-xl font-semibold">Вход администратора</h2>
        <p className="text-sm text-slate-600">Для просмотра и сравнения цен вход не требуется.</p>
        <label className="block text-sm font-medium">Имя пользователя<input className="admin-field" autoComplete="username" required value={username} onChange={e => setUsername(e.target.value)} /></label>
        <label className="block text-sm font-medium">Пароль<input className="admin-field" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
        <button className={button} disabled={busy}>{busy ? 'Входим…' : 'Войти'}</button>
      </form> : !isAdmin ? <p>Для изменения цен нужны права администратора.</p> : <>
      <fieldset disabled={busy} className="grid md:grid-cols-2 gap-5 mb-6">
        <label className="text-sm font-medium">Товар<select className="admin-field" value={productId} onChange={e => setProductId(Number(e.target.value))}>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label className="text-sm font-medium">Магазин · {selectedCity?.name}<select className="admin-field" value={storeId} onChange={e => setStoreId(Number(e.target.value))}>{stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      </fieldset>
      <form onSubmit={save} className="rounded-xl border border-slate-200 bg-white p-5 mb-7">
        <h2 className="text-lg font-semibold mb-4">{editId ? 'Исправить запись' : 'Добавить цену'}</h2>
        <fieldset disabled={busy} className="flex flex-wrap gap-4 items-end">
          <label className="text-sm font-medium flex-1 min-w-40">Цена, ₽<input className="admin-field" type="number" min="0.01" max="99999999.99" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} /></label>
          <label className="text-sm font-medium flex-1 min-w-40">Дата цены<input className="admin-field" type="date" max={today()} required value={date} onChange={e => setDate(e.target.value)} /></label>
          <button className={button} disabled={!productId || !storeId}>{busy ? 'Сохраняем…' : 'Сохранить'}</button>
          {editId && <button type="button" className="px-4 py-2" onClick={() => { setEditId(undefined); setPrice(''); setDate(today()) }}>Отмена</button>}
        </fieldset>
        <p className="text-sm text-slate-500 mt-3">Для товара в одном магазине сохраняется одна цена за дату. Существующую запись можно исправить.</p>
      </form>
      <h2 className="text-xl font-semibold mb-3">История цен</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full text-sm text-left">
        <thead className="bg-slate-100"><tr><th scope="col" className="p-4">Дата</th><th scope="col" className="p-4">Цена</th><th scope="col" className="p-4">Действия</th></tr></thead>
        <tbody>{[...rows].reverse().map(r => <tr key={r.id} className="border-t border-slate-100">
          <td className="p-4 whitespace-nowrap">{r.priceDate}</td><td className="p-4 whitespace-nowrap">{Number(r.price).toFixed(2)} ₽</td>
          <td className="p-4"><div className="flex flex-wrap gap-3"><button disabled={busy} className="text-emerald-800 underline" onClick={() => { setEditId(r.id); setPrice(String(r.price)); setDate(r.priceDate); setError(''); setNotice('') }}>Изменить</button>
            <button disabled={busy} className="text-red-700 underline" onClick={() => setDeleteId(r.id)}>Удалить</button></div></td></tr>)}</tbody>
      </table>{rows.length === 0 && <p className="p-5 text-slate-600">Для выбранного товара и магазина ещё нет цен.</p>}</div>
      {deleteId && <div role="alert" className="mt-5 border border-red-200 bg-red-50 p-5 rounded-xl">
        <p className="mb-3">Удалить запись за {rows.find(r => r.id === deleteId)?.priceDate}? Это изменит историю цен.</p>
        <button disabled={busy} className="rounded-lg bg-red-700 text-white px-4 py-2 mr-3" onClick={remove}>Подтвердить удаление</button>
        <button disabled={busy} className="underline" onClick={() => setDeleteId(undefined)}>Отменить удаление</button>
      </div>}
    </>}
  </div>
}
