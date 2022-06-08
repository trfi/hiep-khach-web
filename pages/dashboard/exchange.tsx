import axiosClient from '@/api/axios-client'
import { DashboardLayout } from '@/components/layouts'
import { NextPageWithLayout } from '@/models'
import { useState } from 'react'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import useSWRImmutable from 'swr/immutable'
import { useAuth } from '@/hooks'

const Exchange: NextPageWithLayout = () => {
  const [server, setServer] = useState(0)
  const [roles, setRoles] = useState<Array<any>>([])
  const { user, mutate: mutateUser } = useAuth()
  const { data: servers } = useSWRImmutable('/game/servers')
  const { data: knbPackages } = useSWRImmutable('/game/knbpack')

  const exchangeHistory = useSWR('/history/exchange')
  const userBalance = useSWR('/wallet/balance')

  const handleChangeServer = (e: any) => {
    setServer(+e.target.value)
    axiosClient
      .get(`/game/roles/${e.target.value}`)
      .then((data: any) => setRoles(data))
      .catch((e) => toast.error(e))
  }

  const [role, setRole] = useState('')

  const handleChangeRole = (e: any) => {
    setRole(e.target.value)
  }

  function test() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 1000)
    })
  }

  async function buyHandle(e: any, packId: string) {
    if (!role) return toast.error('Please select character')
    e.target.disabled = true
    try {
      const character = roles.find((r) => r.id == role).name
      const serverName = servers.find((s: any) => s.id == server).name
      await axiosClient.post('/game/buyknbpack', {
        packId,
        server: serverName,
        role,
        character,
      })
      await test()
      toast.success('Buy success, check your mail in game')
      mutateUser()
      exchangeHistory.mutate()
      userBalance.mutate()
    } catch (e: any) {
      toast.error(e.message)
    }
    e.target.disabled = false
  }

  return (
    <div className="w-full">
      <div className="text-center">
        <h1 className="text-4xl font-bold">QUY ĐỔI KNB <img className='inline' src="/images/knb.png" width={55} alt="knb" /></h1>
      </div>

      <div className="mt-[4vh] flex flex-col items-center gap-6">
        <select
          onChange={handleChangeServer}
          className="select select-primary w-full max-w-xs"
          defaultValue="server"
        >
          <option value="server" disabled>
            Server
          </option>
          {servers?.map((server: { id: number; name: string }) => (
            <option value={server.id} key={server.id}>
              {server.name}
            </option>
          ))}
        </select>
        <select
          onChange={handleChangeRole}
          className="select select-primary w-full max-w-xs"
          defaultValue="character"
        >
          <option value="character" disabled>
            Character
          </option>
          {roles && roles?.length ? (
            roles.map((role: { id: number; name: string }) => (
              <option value={role.id} key={role.id}>
                {role.name}
              </option>
            ))
          ) : server == 0 ? (
            <option disabled>Choose server</option>
          ) : (
            <option disabled>Character not created yet</option>
          )}
        </select>
      </div>

      <div className="mx-auto mt-[6vh] grid grid-cols-1 gap-6 md:grid-cols-2 xl:max-w-6xl">
        {knbPackages &&
          Object.values(knbPackages).map((pack: any) => (
            <div
              className="card bg-neutral text-slate-100 shadow-xl"
              key={pack.id}
            >
              <div className="card-body">
                <h3 className="card-title text-4xl font-bold">
                  ${pack.price.toLocaleString()}
                </h3>
                <p className='text-yellow-400'>
                  = {pack.knb.toLocaleString()} KNB <img className='inline' src="/images/knb.png" width={25} alt="knb" />
                  {!user.firstExchange && <p>{pack.bonus && `Bonus ${pack.bonus}%`}{pack.gift && ' + Tặng thú cưỡi Kim Mao Sư Vương'}</p>}
                </p>
                <div className="card-actions items-end justify-between">
                  <code className="text-sm text-red-300">
                    {!user.firstExchange && pack.note}
                  </code>
                  <button
                    onClick={(e) => buyHandle(e, pack.id)}
                    className="btn btn-primary disabled:bg-gray-700"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

Exchange.Layout = DashboardLayout

export default Exchange
