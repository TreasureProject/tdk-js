import * as Dialog from '@radix-ui/react-dialog';

function RadixModal() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className='text-violet-600 shadow-black/50 hover:bg-gray-300 inline-flex h-[35px] items-center justify-center rounded-[4px] bg-white px-[15px] font-medium leading-none shadow-[0_2px_10px] focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none'>
          Edit profile
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className='bg-black/60 fixed inset-0' />
        <Dialog.Content className='fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none'>
          <Dialog.Title className='text-gray-900 m-0 text-[17px] font-medium'>
            Edit profile
          </Dialog.Title>
          <Dialog.Description className='text-gray-800 mt-[10px] mb-5 text-[15px] leading-normal'>
            Make changes to your profile here. Click save when you are done.
          </Dialog.Description>
          <fieldset className='mb-[15px] flex items-center gap-5'>
            <label className='text-violet-600 w-[90px] text-right text-[15px]' htmlFor='name'>
              Name
            </label>
            <input
              className='text-violet-600 shadow-purple-500/50 focus:shadow-purple-600/50 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]'
              id='name'
              defaultValue='Pedro Duarte'
            />
          </fieldset>
          <fieldset className='mb-[15px] flex items-center gap-5'>
            <label className='text-violet-600 w-[90px] text-right text-[15px]' htmlFor='username'>
              Username
            </label>
            <input
              className='text-violet-600 shadow-purple-500/50 focus:shadow-purple-600/50 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]'
              id='username'
              defaultValue='@peduarte'
            />
          </fieldset>
          <div className='mt-[25px] flex justify-end'>
            <Dialog.Close asChild>
              <button className='bg-green-400 text-slate-600 hover:bg-green-500 focus:shadow-green-600/50 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:shadow-[0_0_0_2px] focus:outline-none'>
                Save changes
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Close asChild>
            <button
              className='text-violet-600 hover:bg-violet-400 focus:shadow-violet-500/50 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none'
              aria-label='Close'>
              X
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default RadixModal;
