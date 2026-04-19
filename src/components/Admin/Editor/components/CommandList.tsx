import React, { useEffect, useImperativeHandle, useState } from 'react';

export interface CommandListProps {
  items: any[];
  command: any;
  editor: any;
  range: any;
}

export interface CommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const CommandList = React.forwardRef<CommandListRef, CommandListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const selectedItem = container.children[0]?.children[selectedIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  return (
    <div
      ref={scrollContainerRef}
      className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-slate-200 bg-white p-1 shadow-md dark:border-slate-800 dark:bg-slate-950"
    >
      {props.items.length ? (
        <div className="flex flex-col gap-1">
          {props.items.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={index}
                className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none ${
                  isSelected ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                onClick={() => selectItem(index)}
              >
                {item.icon}
                <div className="flex flex-col items-start">
                  <span className="font-medium">{item.title}</span>
                  {item.description && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.description}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-2 text-sm text-slate-500">No results</div>
      )}
    </div>
  );
});

CommandList.displayName = 'CommandList';
