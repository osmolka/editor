import { useCurrentUser } from '../context/CurrentUserContext'

export function UserSwitcher() {
  const { currentUser, users, setCurrentUserId } = useCurrentUser()

  return (
    <label className="user-switcher">
      Acting as{' '}
      <select
        value={currentUser.id}
        onChange={(e) => setCurrentUserId(Number(e.target.value))}
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </label>
  )
}
