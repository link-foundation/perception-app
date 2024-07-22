import React from 'react';
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { Box, Text } from '@chakra-ui/react';
import { LinkButton } from './link';
import { RadialChart } from './charts/radial-chart';

export function Dash() {
  const deep = useDeep();
  const [user] = deep.useMinilinksSubscription({ id: deep.linkId });
  const packages = deep.useMinilinksSubscription({
    type_id: deep.idLocal('@deep-foundation/core', 'Package'),
  });
  const { data: usersCount }: any = deep.useSubscription({
    type_id: deep.idLocal('@deep-foundation/core', 'User'),
  }, { aggregate: 'count' });
  const { data: rejectsCount }: any = deep.useSubscription({
    type_id: deep.idLocal('@deep-foundation/core', 'Rejected'),
  }, { aggregate: 'count' });
  const { data: resolvesCount }: any = deep.useSubscription({
    type_id: deep.idLocal('@deep-foundation/core', 'Resolved'),
  }, { aggregate: 'count' });
  const { data: calculatingCount }: any = deep.useSubscription({
    type_id: deep.idLocal('@deep-foundation/core', 'Promise'),
    _not: { out: { type_id: { _in: [deep.idLocal('@deep-foundation/core', 'Rejected'), deep.idLocal('@deep-foundation/core', 'Resolved')] } } },
  }, { aggregate: 'count' });
  const dataProcesses = [
    {name: 'rejects', value: rejectsCount},
    {name: 'resolves', value: resolvesCount},
    {name: 'calculating', value: calculatingCount},
  ]
  console.log('dataProcesses', dataProcesses)
  console.log('usersCount', usersCount)
  console.log('packages', packages)
  return <Box w='100%' h='100%' p='1rem'>
    {/* <Box><LinkButton id={deep.linkId}/></Box> */}
    <Box>
      <Text color='deepColor'>
        User: {deep.linkId || '?'}
      </Text>
    </Box>
    <Box display='grid' gridTemplateColumns='1fr 1fr' gap='1rem'>
      <RadialChart data={dataProcesses} />
    </Box>
    <Box>packages: {packages.length || '?'}</Box>
    <Box>usersCount: {usersCount || '?'}</Box>
  </Box>;
}


