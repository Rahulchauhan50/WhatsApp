import React from 'react'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { useSelector } from 'react-redux'
import { BsThreeDotsVertical } from 'react-icons/bs'

type CustomContextMenuProps = {
  showContextMenu: (e: React.MouseEvent<SVGElement>) => void;
  options: { name: string; callback: () => void }[];
  setContextMenu: (value: boolean) => void;
};

export default function CustomContextMenu({showContextMenu, options, setContextMenu}: CustomContextMenuProps) {
    const { UserInfo } = useSelector((state: any) => state.user);
    const hadleClick = (e: React.MouseEvent<HTMLSpanElement>, callback: () => void) => {
        e.stopPropagation();
        setContextMenu(false)
        callback()
      }
    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
      }
  return (
    <div>
        <Menu as="div" className="relative ml-1">
                  <div>
                    <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <BsThreeDotsVertical  onClick={(e)=>showContextMenu(e)}  className="text-panel-header-icon cursor-pointer text-xl" />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-dropdown-background py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {options.map(({name, callback})=>{
                            return  <Menu.Item  key={name}>
                            {({ active }) => (
                              <span
                                onClick={(e)=>{hadleClick(e, callback)}}
                                className={classNames(active ? '' : '', 'block px-4 py-2 text-sm text-white cursor-pointer')}
                              >
                              {name}
                              </span>
                            )}
                          </Menu.Item>
                        })}
    
                    </Menu.Items>
                  </Transition>
                </Menu>
    </div>
  )
}
