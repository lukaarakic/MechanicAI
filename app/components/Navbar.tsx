import { FC, useState } from 'react'
import { Popover } from 'react-tiny-popover'

import NewChatIcon from '~/assets/icons/new-chat-icon.svg?react'
import WhiteLogo from '~/assets/logo-white.svg?react'
import HomeIcon from '~/assets/icons/home-icon.svg?react'
import HistoryIcon from '~/assets/icons/history-icon.svg?react'
import SettingsIcon from '~/assets/icons/settings-icon.svg?react'
import { Form, Link, NavLink } from '@remix-run/react'
import Button from '~/components/ui/button'

interface NavbarProps {
  firstName: string
  lastName: string
  email: string
  avatar: string
}

const Navbar: FC<NavbarProps> = ({ email, firstName, lastName, avatar }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  return (
    <nav className="fixed bottom-0 z-50 grid h-[5rem] w-full grid-cols-5 place-items-center items-center rounded-br-7 rounded-tr-7 bg-light-gray shadow-small md:top-0 md:flex md:h-full md:min-h-dvh md:w-[5rem] md:flex-col md:py-20">
      <NavLink to="/">
        <WhiteLogo className="h-40 w-40 md:mb-20" />
      </NavLink>

      <div className="hidden h-0.5 w-full bg-white opacity-25 md:block" />

      <NavLink
        to="/new-chat"
        className={({ isActive }) =>
          `h-30 w-30 rounded-7 border border-white p-5 md:my-20 md:h-35 md:w-35 ${
            isActive ? 'fill-blue-700' : 'fill-white'
          }`
        }
      >
        <NewChatIcon />
      </NavLink>

      <NavLink
        to="/"
        className={({ isActive }) =>
          `mb-20 hidden h-25 w-25 md:block ${isActive ? 'fill-blue-700' : 'fill-white'}`
        }
      >
        <HomeIcon />
      </NavLink>

      <NavLink
        to="/history"
        className={({ isActive }) =>
          `h-30 w-30 md:mb-auto md:h-25 md:w-25 ${isActive ? 'fill-blue-700' : 'fill-white'}`
        }
      >
        <HistoryIcon />
      </NavLink>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `h-30 w-30 md:mb-20 md:h-25 md:w-25 ${isActive ? 'fill-blue-700' : 'fill-white'}`
        }
      >
        <SettingsIcon />
      </NavLink>

      <Popover
        containerClassName="z-[60]"
        isOpen={isPopoverOpen}
        positions={['right', 'top', 'bottom']}
        content={
          <div className="mr-5 min-w-64 rounded-7 border border-white/25 bg-light-gray p-15 md:mb-25 md:ml-10">
            <p className="text-16 font-semibold">
              {firstName} {lastName}
            </p>
            <p className="mb-5 text-14 opacity-25">{email}</p>

            <p className="mb-20 font-bold">
              Tokens: <span className="text-green">10</span>
            </p>

            <div className="flex items-center gap-10">
              <Form method="post" action="/logout">
                <Button variant="destructive" className="!py-1 px-25 text-14">
                  Log out
                </Button>
              </Form>
              <Button variant="outline" className="!py-1 px-25 text-14">
                <Link to={'/settings/car'}>Cars</Link>
              </Button>
            </div>
          </div>
        }
        onClickOutside={() => setIsPopoverOpen(false)}
      >
        <button
          className="h-35 w-35 rounded-full"
          onClick={() => setIsPopoverOpen((prevState) => !prevState)}
          aria-label="Toggle Popover"
        >
          <img
            src={avatar}
            alt="User Avatar"
            className="h-full w-full rounded-full object-cover"
          />
        </button>
      </Popover>
    </nav>
  )
}

export default Navbar
