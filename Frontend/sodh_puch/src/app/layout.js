// pages/_app.js or app/layout.js (in the new app directory)

import { ActionQueueProvider } from './context/ActionQueueProvider';

function MyApp({ Component, pageProps }) {
  return (
    <ActionQueueProvider>
      <Component {...pageProps} />
    </ActionQueueProvider>
  );
}

export default MyApp;
