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

import { initPackageContact, createAllContacts } from "../imports/packages/contact/contact";
import { getIsPackageInstalled } from '../imports/get-is-package-installed';

import { createAllCallHistory } from "../imports/packages/callhistory/callhistory";
import { initPackageClipboard, copyClipboardToDeep } from "../imports/packages/clipboard/clipboard";

import {
  createTelegramPackage,
} from "../imports/packages/telegram/telegram";

function Page() {
  const deep = useDeep();

  const [deviceLinkId, setDeviceLinkId] = useLocalStore(
    'deviceLinkId',
    undefined
  );

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

      const getIsDevicePackageInstalled = async () => {
        const devicePackageSelectResponse = await deep.select({
          type_id: {
            _id: ['@deep-foundation/core', 'Contain'],
          },
          from_id: deep.linkId,
          to: {
            type_id: {
              _id: ['@deep-foundation/core', 'Package'],
            },
            string: {
              value: DEVICE_PACKAGE_NAME,
            },
          },
        });
        const isDevicePackageInstalled =
          devicePackageSelectResponse.data.length > 0;
        return isDevicePackageInstalled;
      }

      if (!await getIsDevicePackageInstalled()) {
        await insertDevicePackageLinksToDeep({ deep });
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
            <button onClick={() => createAllCallHistory({ deep, deviceLinkId })}>create All CallHistory</button>
            <hr />
          </div>
        <div>
          <hr />
          <button onClick={() => createAllContacts({ deep, deviceLinkId })}>create All Contacts</button>
          <br />
          <button onClick={() => initPackageContact({ deep })}>create Contact Package</button>
          <hr />
        </div>
        <div>
        <button onClick={() => createTelegramPackage({ deep })}>create telegram Package</button>
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
