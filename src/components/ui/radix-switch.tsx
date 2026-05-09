'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';

type SwitchProps = React.ComponentPropsWithoutRef<
  typeof SwitchPrimitives.Root
> & {
  leftIcon?: React.ElementType;
  rightIcon?: React.ElementType;
  thumbIcon?: React.ElementType;
};

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(
  (
    {
      className,
      style,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      thumbIcon: ThumbIcon,
      ...props
    },
    ref,
  ) => {
    const [isChecked, setIsChecked] = React.useState(
      props?.checked ?? props?.defaultChecked ?? false,
    );
    const [isTapped, setIsTapped] = React.useState(false);

    React.useEffect(() => {
      setIsChecked(props?.checked ?? props?.defaultChecked ?? false);
    }, [props?.checked, props?.defaultChecked]);

    return (
      <SwitchPrimitives.Root
        {...props}
        onCheckedChange={(checked) => {
          setIsChecked(checked);
          props.onCheckedChange?.(checked);
        }}
        asChild
      >
        <motion.button
          ref={ref}
          className={cn(
            'relative flex p-[2px] h-[31px] w-[51px] shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#34C759] data-[state=unchecked]:bg-[#E9E9EA] dark:data-[state=unchecked]:bg-[#39393D]',
            className,
          )}
          style={{
            ...style,
            justifyContent: isChecked ? 'flex-end' : 'flex-start',
          }}
          whileTap="tap"
          initial={false}
          onTapStart={() => setIsTapped(true)}
          onTapCancel={() => setIsTapped(false)}
          onTap={() => setIsTapped(false)}
        >
          {LeftIcon && (
            <motion.div
              animate={
                isChecked ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }
              }
              transition={{ type: 'spring', bounce: 0 }}
              className="absolute left-1 top-1/2 -translate-y-1/2 dark:text-neutral-500 text-neutral-400"
            >
              <LeftIcon className="size-3" />
            </motion.div>
          )}

          {RightIcon && (
            <motion.div
              animate={
                isChecked ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }
              }
              transition={{ type: 'spring', bounce: 0 }}
              className="absolute right-1 top-1/2 -translate-y-1/2 dark:text-neutral-400 text-neutral-500"
            >
              <RightIcon className="size-3" />
            </motion.div>
          )}

          <SwitchPrimitives.Thumb asChild>
            <motion.div
              whileTap="tab"
              className={cn(
                'relative z-[1] flex items-center justify-center rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15)] ring-[0.5px] ring-black/5 dark:ring-white/10 dark:text-neutral-400 text-neutral-500',
              )}
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              style={{
                width: 27,
                height: 27,
              }}
              animate={
                isTapped
                  ? { width: 34, transition: { duration: 0.1 } }
                  : { width: 27, transition: { duration: 0.1 } }
              }
            >
              {ThumbIcon && <ThumbIcon className="size-3" />}
            </motion.div>
          </SwitchPrimitives.Thumb>
        </motion.button>
      </SwitchPrimitives.Root>
    );
  },
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch, type SwitchProps };