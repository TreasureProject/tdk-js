/* eslint-disable react/prop-types */

import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

type ButtonType = 'link' | 'compact' | 'base';
type ButtonSize = 'xs' | 'sm' | 'base' | 'lg';
type ButtonColor = 'ruby' | 'honey' | 'night' | 'silver' | 'nebula';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  btnType: ButtonType;
  size: ButtonSize;
  color: ButtonColor;
  className?: string;
  leftIcon?: boolean;
  rightIcon?: boolean;
  children?: React.ReactNode;
}

const buttonTypeClasses: Record<ButtonType, string> = {
  link: 'link styles heres',
  compact: 'compact styles here',
  base: 'base btn style',
};

const buttonSizeClasses: Record<ButtonSize, string> = {
  xs: '',
  sm: '',
  base: '',
  lg: '',
};

const buttonColorClasses: Record<ButtonColor, string> = {
  ruby: '',
  honey: '',
  night: '',
  silver: '',
  nebula: '',
};

const Button: React.FC<ButtonProps> = ({ className, children, size, color, btnType, ...props }) => {
  const buttonClasses = twMerge(
    'rounded font-semibold',
    buttonSizeClasses[size],
    buttonColorClasses[color],
    buttonTypeClasses[btnType],
    className
  );

  return (
    <button className={clsx(buttonClasses)} {...props}>
      {children}
    </button>
  );
};

export default Button;
