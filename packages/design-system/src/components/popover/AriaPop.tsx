/* eslint-disable react/prop-types */
import { Button, Dialog, DialogTrigger, Link, OverlayArrow, Popover } from 'react-aria-components';
import type { PopoverProps } from 'react-aria-components';

function AriaProp() {
  return (
    <div className='bg-gradient-to-r from-orange-400 to-pink-600 p-8 rounded-lg sm:h-[300px] flex items-start justify-center'>
      <DialogTrigger>
        <Button
          aria-label='Notifications'
          className='inline-flex items-center justify-center rounded-md bg-black bg-opacity-20 bg-clip-padding border border-white/20 px-3.5 py-2 font-medium text-white hover:bg-opacity-30 pressed:bg-opacity-40 transition-colors cursor-default outline-none focus-visible:ring-2 focus-visible:ring-white/75'>
          🔔
        </Button>
        <MyPopover>
          <OverlayArrow>
            <svg
              viewBox='0 0 12 12'
              className='block fill-white group-placement-bottom:rotate-180 w-4 h-4'>
              <path d='M0 0L6 6L12 0' />
            </svg>
          </OverlayArrow>
          <Dialog className='p-2 outline-none text-gray-700'>
            <div className='flex flex-col'>
              <Notification
                avatar='https://images.unsplash.com/photo-1569913486515-b74bf7751574?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                name='Sonja Balmann'
                time='2h'
                text="This looks great! Let's ship it."
              />
              <Notification
                avatar='https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                name='Maia Pettegree'
                time='4h'
                text='Can you add a bit more pizzazz?'
              />
              <Notification
                avatar='https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80'
                name='Charles Webb'
                time='1d'
                text="Here's a first pass. What do you think?"
              />
            </div>
          </Dialog>
        </MyPopover>
      </DialogTrigger>
    </div>
  );
}

function MyPopover(props: PopoverProps) {
  return (
    <Popover
      {...props}
      className={({ isEntering, isExiting }) => `
        w-[280px] placement-bottom:mt-2 placement-top:mb-2 group rounded-lg drop-shadow-lg ring-1 ring-black/10 bg-white
        ${
          isEntering
            ? 'animate-in fade-in placement-bottom:slide-in-from-top-1 placement-top:slide-in-from-bottom-1 ease-out duration-200'
            : ''
        }
        ${
          isExiting
            ? 'animate-out fade-out placement-bottom:slide-out-to-top-1 placement-top:slide-out-to-bottom-1 ease-in duration-150'
            : ''
        }
      `}
    />
  );
}
// @ts-expect-error go fast
function Notification({ avatar, name, time, text }) {
  return (
    <Link
      href='#'
      className='p-2 rounded-lg hover:bg-gray-100 grid grid-cols-[theme(width.5)_1fr_theme(width.4)] gap-x-2 text-[inherit] no-underline outline-none focus-visible:ring-2 ring-pink-800'>
      <img src={avatar} className='rounded-full w-5 h-5 row-span-3' />
      <div className='text-gray-800 font-semibold leading-5'>{name}</div>
      <div className='text-gray-400'>💬</div>
      <div className='text-sm text-gray-500 col-span-2'>Commented {time} ago</div>
      <p className='text-sm overflow-hidden text-ellipsis line-clamp-2 mt-1 mb-0 col-span-2'>
        {text}
      </p>
    </Link>
  );
}

export default AriaProp;
