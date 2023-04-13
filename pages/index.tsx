import React, { useEffect, useMemo, useState } from 'react';
import { ApolloClientTokenizedProvider } from '@deep-foundation/react-hasura/apollo-client-tokenized-provider';
import {
  TokenProvider,
  useTokenController,
} from '@deep-foundation/deeplinks/imports/react-token';
import { useQuery, useSubscription, gql } from '@apollo/client';
import {
  LocalStoreProvider,
  useLocalStore,
} from '@deep-foundation/store/local';
import {
  MinilinksLink,
  MinilinksResult,
  useMinilinksConstruct,
} from '@deep-foundation/deeplinks/imports/minilinks';
import { ChakraProvider, Text } from '@chakra-ui/react';
import { Provider } from '../imports/provider';
import {
  DeepProvider,
  useDeep,
} from '@deep-foundation/deeplinks/imports/client';
import Link from 'next/link';
import { PACKAGE_NAME as DEVICE_PACKAGE_NAME } from '../imports/device/package-name';
import { getIsPackageInstalled } from '../imports/get-is-package-installed';

import { initPackageHaptic, useHapticVibrate } from "../imports/packages/haptics/haptics";
import { createAllCallHistory } from "../imports/packages/callhistory/callhistory";
import { initPackageClipboard, copyClipboardToDeep } from "../imports/packages/clipboard/clipboard";
import {Haptics} from '@capacitor/haptics';

function Page() {
  const deep = useDeep();

  const [deviceLinkId, setDeviceLinkId] = useLocalStore(
    'deviceLinkId',
    undefined
  );

  useHapticVibrate({deviceLinkId});

  useEffect(() => {
    if (deep.linkId === 0) {
      deep.guest();
    }
  }, []);

  useEffect(() => {
    new Promise(async () => {
      if (deep.linkId != 0) {
        const adminLinkId = await deep.id('deep', 'admin');
        if (deep.linkId != adminLinkId) {

          await deep.login({
            linkId: adminLinkId,
          });
        }
      }
    });
  }, [deep]);

  useEffect(() => {
    if (deep.linkId == 0) {
      return;
    }
    new Promise(async () => {
      const adminLinkId = await deep.id('deep', 'admin');
      if (deep.linkId != adminLinkId) {
        return;
      }
      if (!deviceLinkId) {
        const initializeDeviceLink = async () => {
          const deviceTypeLinkId = await deep.id(DEVICE_PACKAGE_NAME, 'Device');
          const containTypeLinkId = await deep.id(
            '@deep-foundation/core',
            'Contain'
          );
          const {
            data: [{ id: newDeviceLinkId }],
          } = await deep.insert({
            type_id: deviceTypeLinkId,
            in: {
              data: [
                {
                  type_id: containTypeLinkId,
                  from_id: deep.linkId,
                },
              ],
            },
          });
          setDeviceLinkId(newDeviceLinkId);
        };
        initializeDeviceLink();
      }
    });
  }, [deep]);

  return (
    <div>
      <h1>Deep.Foundation sdk examples</h1> 
      <Text suppressHydrationWarning>Authentication Link Id: {deep.linkId ?? " "}</Text> 
      <Text suppressHydrationWarning>Device Link Id: {deviceLinkId ?? " "}</Text>
      {deviceLinkId &&
        <>
          <div>
            <Link href="/all">all subscribe</Link>
          </div>
          <div>
            <Link href="/messanger">messanger</Link>
          </div>
          <div>
            <Link href="/device">device</Link>
          </div>
          <div>
            <button onClick={() => initPackageHaptic({ deep })}>create haptic Package</button>
          </div>
          <div>
            <button onClick={() => createAllCallHistory({ deep, deviceLinkId })}>create All CallHistory</button>
          </div>
        <div>
          <hr />
          <button onClick={() => initPackageClipboard({ deep })}>create clipboard Package</button>
          <br />
          <button onClick={() => copyClipboardToDeep({ deep, deviceLinkId })}>copy Clipboard to deep</button>
          <hr />
        </div>
        </>
      }
    </div>
  );
}

export default function Index() {
  return (
    <>
      <ChakraProvider>
        <Provider>
          <DeepProvider>
            <Page />
          </DeepProvider>
        </Provider>
      </ChakraProvider>
    </>
  );
}
