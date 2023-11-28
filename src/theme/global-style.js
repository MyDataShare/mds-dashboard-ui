import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html {
    background-color: #ffffff;
    color: #000000;

    /* Enable sensible font scaling using the root font size */
    //font-size: calc(.965em + 0.18vw);

    box-sizing: border-box;
    scroll-behavior: smooth;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-variant-ligatures: common-ligatures;
    line-height: 1.618;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  html,
  body,
  #root {
    margin: 0;
    padding: 0;
    height: 100%;
  }

  main {
    width: fit-content;
    margin: 0 auto;
  }

  input,
  textarea,
  select,
  button {
    line-height: 1.618;
    font-size: 1em;
    max-width: 72ch;
  }

  p,
  ol,
  ul,
  blockquote,
  pre,
  label {
    max-width: 72ch;
    margin-top: 1em;
    margin-bottom: 1em;
  }

  ul ul,
  ol ol,
  ul ol,
  ol ul {
    margin-top: 0.3em;
    margin-bottom: 0.3em;
  }

  li {
    margin-bottom: 0.3em;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
    margin-top: 3em;
    margin-bottom: 0.5em;
    scroll-margin-top: 1em;
    width: fit-content;
  }

  h1 + h2 {
    margin-top: 0;
  }

  h2 + h3,
  h3 + h4,
  h4 + h5,
  h5 + h6 {
    margin-top: 1.5em;
  }

  h1 {
    font-size: calc(1.5em + 0.5vw);
    font-weight: 800;
    margin-bottom: 1em;
    max-width: 35ch;
  }

  hr {
    height: 0.063em;
    border: 0;
    border-bottom: 1px solid ${(props) => props.theme.grey300};
    outline: 0;
    clear: both;
    margin: calc(1.8em + .6vw) 0;
  }

  blockquote {
    border-left: 3px solid ${(props) => props.theme.grey900};
    margin-top: 1.5em;
    margin-bottom: 1.5em;
    padding-left: 1.2em;
    margin-left: 0;
    font-style: italic;
  }

  button {
    border: none;
    -webkit-appearance: none;
    padding: 0;
    font-size: inherit;
    text-decoration: none;
    display: inline-block;
    vertical-align: middle;
    text-align: center;
    width: auto;
    fill: currentColor;
    white-space: inherit;
    background-color: inherit;
  }

  button:hover {
    cursor: pointer;
  }

  a[rel*="noopener"]::after {
    content: "\\00A0↗";
  }
  
  a, a:visited {
    color: currentColor;
  }
  
  .breadcrumbs + h1 {
    margin-top: 0.5em;
  }
  
  .labeledValue + .labeledValue {
    margin: 0.75em 0;
  }
`;

export default GlobalStyle;
