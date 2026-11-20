'use client';
/**
 * Button — สร้างด้วย twin.macro (Tailwind + styled-components)
 * variant: primary (เขียว) | outline (เส้นขอบ) | danger (แดง)
 */
import tw, { styled } from 'twin.macro';
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'outline' | 'danger';

const StyledButton = styled.button<{ $variant: ButtonVariant }>(({ $variant }) => [
  tw`min-h-[36px] cursor-pointer rounded-lg border-0 px-3.5 py-2 text-white`,
  tw`transition-opacity disabled:(cursor-not-allowed opacity-40)`,
  { '& + &': { marginLeft: '0.375rem' } },
  $variant === 'primary' && tw`bg-brand`,
  $variant === 'outline' && tw`border border-solid border-line bg-transparent text-ink`,
  $variant === 'danger' && tw`bg-[#7f1d1d]`,
]);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = 'primary', type = 'button', ...rest }: ButtonProps) {
  return <StyledButton type={type} $variant={variant} {...rest} />;
}
