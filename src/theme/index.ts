export const colors = {
  vgGreen: '#0f9b5f',
  vgOrange: '#ff7f00',
  vgPink: '#f09eb4',
  vgTan: '#e8e1ce',
  vgViolet: '#a891ff',
  vgYellow: '#f8d737',
  green50: '#dbf0e7',
  green100: '#b7e1cf',
  green200: '#9be1c2',
  green800: '#0d8752',
  green900: '#0b7447',
  green950: '#08683e',
  grey200: '#f3f3f3',
  grey250: '#e6e6e6',
  grey300: '#cccccc',
  grey600: '#6f6f6f',
  grey700: '#545454',
  grey800: 'rgba(0, 0, 0, 0.5)',
  grey900: 'rgba(0, 0, 0, 0.8)',
  red50: '#ffeded',
  red100: '#fcdcdc',
  red900: '#ad0000',
  red950: '#990000',
  errorColor: '#c10000',
  errorColorLighter: '#d66b6b',
  statusActive: '#0f9b5f',
  statusDeclined: '#e6e6e6',
  statusExpired: '#e6e6e6',
  statusPending: '#f8d737',
  statusWithdrawn: '#e6e6e6',
};

const theme = {
  ...colors,

  screenReaderOnly:
    'clip: rect(0 0 0 0);clip-path: inset(50%);height: 1px;overflow: hidden;position: absolute;white-space: nowrap;width: 1px;',

  spacingM: '2em',
  spacingL: '4em',

  fontSizeSmaller: '0.875em',
  fontSizeLarger: '1.125em',

  fontLight: '300',
  fontRegular: '400',
  fontMedium: '500',
  fontSemiBold: '600',
  fontBold: '700',
  fontBlack: '900',
};

export type Theme = typeof theme;
export type Color = keyof typeof colors;

export default theme;
