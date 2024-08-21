import '../imports/style.css';
import { appWithTranslation } from 'next-i18next';
import { Provider } from '../src/provider';
import c from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { useEffect } from 'react';

if (typeof(crypto) === 'object') {
  crypto.__proto__randomUUID = uuidv4;
}

function App({ Component, pageProps }) {
  return (
    <>
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"></link>
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"></link>
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"></link>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>
      <script src="https://telegram.org/js/telegram-web-app.js"></script>
      <Provider>
        <Component {...pageProps} />
      </Provider>
    </>
  );
}

export default appWithTranslation(App);
