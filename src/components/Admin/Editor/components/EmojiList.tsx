import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useRef,
} from 'react'
import Image from 'next/image'

export interface EmojiListProps {
  items: any[]
  command: any
}

export interface EmojiListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

export const EmojiList = forwardRef<EmojiListRef, EmojiListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const selectItem = (index: number) => {
    const item = props.items[index]

    if (item) {
      props.command({ name: item.name })
    }
  }

  useEffect(() => {
    setSelectedIndex(0)
  }, [props.items])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      const selectedItem = container.children[0]?.children[selectedIndex] as HTMLElement
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedIndex])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
        return true
      }

      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length)
        return true
      }

      if (event.key === 'Enter') {
        selectItem(selectedIndex)
        return true
      }

      return false
    },
  }))

  return (
    <div
      ref={scrollContainerRef}
      className="z-50 h-auto max-h-[330px] w-56 overflow-y-auto rounded-md border border-slate-200 bg-white p-1 shadow-md dark:border-slate-800 dark:bg-slate-950"
    >
      {props.items.length ? (
        <div className="flex flex-col gap-1">
          {props.items.map((item, index) => (
            <button
              className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none ${
                index === selectedIndex
                  ? 'bg-slate-100 dark:bg-slate-800'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              key={index}
              onClick={() => selectItem(index)}
            >
              {item.fallbackImage ? (
                <Image src={item.fallbackImage} className="w-5 h-5" alt={item.name} width={20} height={20} />
              ) : (
                <span className="text-lg leading-none">{item.emoji}</span>
              )}
              <span className="truncate text-slate-700 dark:text-slate-300">
                :{item.name}:
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-2 text-sm text-slate-500">No result</div>
      )}
    </div>
  )
})

EmojiList.displayName = 'EmojiList'
