import { WithPackagesInstalled } from '@deep-foundation/react-with-packages-installed';
import { WithProviders } from './with-providers';
import { StoreProvider } from './store-provider';
import { Button, Stack, Text } from '@chakra-ui/react';
import { useLocalStore } from '@deep-foundation/store/local';
import { CapacitorStoreKeys } from '../../capacitor-store-keys';
import {
  DeepClient,
  DeepProvider,
  useDeep,
} from '@deep-foundation/deeplinks/imports/client';
import { ErrorAlert } from './error-alert';

export interface PageParam {
  renderChildren: (param: {
    deep: DeepClient;
  }) => JSX.Element;
}

export function Page({ renderChildren }: PageParam) {
  return (
    <StoreProvider>
      <WithProviders>
        <WithDeep
          renderChildren={({ deep }) => {
            console.log({ deep });
            return (
              <WithPackagesInstalled
              deep={deep}
                packageNames={[]}
                renderIfError={(error) => <ErrorAlert title={error.message} />}
                renderIfNotInstalled={(packageNames) => (
                  <>
                    <ErrorAlert
                      title={
                        `Install these deep packages to proceed: ${packageNames.join(
                          ', '
                        )}`
                      }
                    />
                  </>
                )}
                renderIfLoading={() => (
                  <Text>Checking if deep packages are installed...</Text>
                )}
              >
                {renderChildren({ deep })}
              </WithPackagesInstalled>
            );
          }}
        />
      </WithProviders>
    </StoreProvider>
  );
}

interface WithDeepProps {
  renderChildren: (param: { deep: DeepClient }) => JSX.Element;
}

function WithDeep({ renderChildren }: WithDeepProps) {
  const deep = useDeep();
  return deep.linkId ? renderChildren({ deep }) : null;
}
