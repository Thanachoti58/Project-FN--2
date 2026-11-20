// Type declarations สำหรับ twin.macro + styled-components v6
import 'twin.macro';
import styledImport from 'styled-components';
import { css as cssImport } from 'styled-components';

declare module 'twin.macro' {
  const styled: typeof styledImport;
  const css: typeof cssImport;
}
