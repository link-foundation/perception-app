import {
  Box,
  Button,
  CircularProgress,
  Flex,
  Grid,
  GridItem,
  Input,
  Text,
} from '@chakra-ui/react';
// import { AutoGuest } from '@deep-foundation/deepcase/imports/auto-guest';
// import { Connector, parseUrl } from '@deep-foundation/deepcase/imports/connector/connector';
// import { useContainer, useSpaceId } from '@deep-foundation/deepcase/imports/hooks';
// import { Provider as ProviderDeepcase } from '@deep-foundation/deepcase/imports/provider';
import { DeepNamespaceProvider, DeepProvider, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { MinilinksProvider } from '@deep-foundation/deeplinks/imports/minilinks';
import { useQueryStore } from '@deep-foundation/store/query';
import { useTranslation } from 'next-i18next';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { IoEnterOutline, IoExitOutline } from "react-icons/io5";
import { GrUserAdmin } from "react-icons/gr";
import pckg from '../package.json';
import { i18nGetStaticProps } from '../src/i18n.tsx';
import { Provider as ProviderSDK, useDeepPath } from '../src/provider.tsx';
import { ColorMode } from '@deep-foundation/perception-imports/imports/theme';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { useTokenController } from '@deep-foundation/deeplinks/imports/react-token';

const { publicRuntimeConfig } = getConfig();

export const Tab = ({
  id, name, type, icon, isActive, onClick,
  side = 'right'
}: {
  id: number;
  name: string;
  type: string;
  icon: string;
  isActive: boolean;
  onClick: (id: number) => void;
  side?: 'left' | 'right';
}) => {
  return <Box position='relative' display='inline-flex' h='3em' role="group">
    <Button
      h='3em' variant={isActive ? 'active' : 'solid'}
      zIndex={1}
      onClick={() => onClick(id)}
    >
      {icon} <Box align='left' pl='0.5em'>
        <Box fontSize="sm">{name || type}</Box>
        <Box fontSize="xxs">{name ? type : ''} {id}</Box>
      </Box>
    </Button>
    <Box
      _groupHover={{ top: '100%' }}
      position='absolute' top='0%' {...({ [side]: '0px' })}
      transition='all 0.3s ease'
    >
      <Button
        h='2.5em' w='2.5em'
        onClick={() => onClick(id)}
      >❌</Button>
      <Button
        h='2.5em' w='2.5em'
        onClick={() => onClick(id)}
      >📌</Button>
    </Box>
  </Box>
};

export const LayoutButton = ({
  id, name, isActive, onClick
}: {
  id: string;
  name: string;
  isActive: boolean;
  onClick: (id: string) => void;
}) => {
  return <Box position='relative' display='inline-flex' h='3em' role="group">
    <Button
      h='3em' w='3em' variant={isActive ? 'active' : 'solid'}
      zIndex={1}
      onClick={() => onClick(id)}
    >
      {name}
    </Button>
    <Box
      _groupHover={{ left: '100%' }}
      position='absolute' left='0%' top='0px'
      transition='all 0.3s ease'
    >
      <Button
        h='2.5em' w='2.5em'
        onClick={() => onClick(id)}
      >❌</Button>
    </Box>
  </Box>
};

export function Status() {
  const deep = useDeep();
  // const status = deep.client.useApolloNetworkStatus();
  const status = {}
  console.log('status', status);
  return <>
    <CircularProgress
      size="1em" isIndeterminate={false} value={100} color={(deep && deep?.linkId) ? 'cyan' : 'red'}
    />
  </>;
}

export function Auth() {
  const deep = useDeep();
  const [path, setPath] = useDeepPath();
  const [token, setToken] = useTokenController();
  const [_path, _setPath] = useState('');
  const [_token, _setToken] = useState('');

  const [canAdmin, setCanAdmin] = useState(false);

  useEffect(() => {
    if (deep && deep?.linkId) {
      deep.can(deep.linkId, deep.linkId, deep.idLocal('@deep-foundation/core', 'AllowAdmin')).then(admin => {
        if (admin) setCanAdmin(false);
        else deep.can(380, deep.linkId, deep.idLocal('@deep-foundation/core', 'AllowLogin')).then(can => setCanAdmin(can));
      });
    }
  }, [deep, deep?.linkId]);

  return <Box display='inline-flex' h='3em' role="group" position="absolute" bottom="0px" left="0px">
    <Button
      w='3em' h='3em'
    >{deep ? <IoExitOutline /> : <IoEnterOutline/>}</Button>
    <Box
      _groupHover={{ left: '0%' }}
      position='absolute' left='-30em' bottom='0px' w={canAdmin ? '26em' : '23em'}
      transition='all 1s ease' overflow="hidden"
      bg="deepBg"
    >
      <Box p={1} display="inline-flex">
        <Input ml={'1em'} value={_path} onChange={e => _setPath(e.target.value)} placeholder="path" w='10em' size='sm'/>
        <Input ml={'1em'} type="password" value={_token} onChange={e => _setToken(e.target.value)} placeholder="token" w='10em' size='sm'/>
      </Box>
      <Button variant="active" w="3em" h="3em" onClick={() => {
        setPath(_path); _setPath('');
        setToken(_token); _setToken('');
      }}>
        <IoEnterOutline/>
      </Button>
      {canAdmin && <Button w="3em" h="3em" onClick={() => {
        deep.id('deep', 'admin').then(admin => deep.login({ linkId: admin }));
      }}>
        <GrUserAdmin/>
      </Button>}
    </Box>
  </Box>;
}

export function Content() {
  const deep = useDeep();
  const { t } = useTranslation();
  const router = useRouter();

  (global as any).deep = deep;
  (global as any).ml = deep?.minilinks;

  // @ts-ignore
  if (typeof(window) === 'object') window.deep = deep;
  console.log('deep', deep);

  const [layout, setLayout] = useQueryStore('layout', 'c');

  const [spaceId, setSpaceId] = useState();
  const [containerId, setContainerId] = useState();

  return (
    <Grid
      templateAreas={`"tabs tabs"
                      "nav main"`}
      gridTemplateRows={'3em 1fr'}
      gridTemplateColumns={'3em 1fr'}
      h='100%' w="100%" position="fixed" l="0%" t="0%"
      color='blackAlpha.700'
      fontWeight='bold'
    >
      <GridItem area={'tabs'} zIndex={1}>
        <Flex w="100%" h="100%">
          <Box flex='1' sx={{ textWrap: "nowrap" }}>
            <Tab
              id={123} name='ivansglazunov' type='user' icon='🥼'
              onClick={id => setSpaceId(id)} isActive={spaceId === 123}
            />
            <Tab
              id={4324} name='onReplyInsert' type='SyncTextFile' icon='📑'
              onClick={id => setSpaceId(id)} isActive={spaceId === 4324}
            />
            <Tab
              id={1273} name='Finder' type='TSX' icon='📑'
              onClick={id => setSpaceId(id)} isActive={spaceId === 1273}
            />
            <Tab
              id={2473} name='Layout' type='TSX' icon='📑'
              onClick={id => setSpaceId(id)} isActive={spaceId === 2473}
            />
            <Tab
              id={4273} name='Menu' type='TSX' icon='📑'
              onClick={id => setSpaceId(id)} isActive={spaceId === 4273}
            />
            <Tab
              id={5173} name='Grid' type='TSX' icon='📑'
              onClick={id => setSpaceId(id)} isActive={spaceId === 5173}
            />
          </Box>
          <Box flex='1' align="right">
            <Tab
              id={452} name='allowUsersInsertSafe' type='Rule' icon='🔥'
              onClick={id => setSpaceId(id)} isActive={spaceId === 452}
              side='left'
            />
          </Box>
        </Flex>
      </GridItem>
      <GridItem area={'nav'} zIndex={1} position="relative" h="100%">
        <LayoutButton isActive={layout === 'c'} id={'c'} name={'c'} onClick={id => setLayout(id)}/>
        <LayoutButton isActive={layout === 'g'} id={'g'} name={'g'} onClick={id => setLayout(id)}/>
        <LayoutButton isActive={layout === 'f'} id={'f'} name={'f'} onClick={id => setLayout(id)}/>
        <LayoutButton isActive={layout === 'o'} id={'o'} name={'o'} onClick={id => setLayout(id)}/>
        <Button w='3em' h='3em'>+</Button>
        <ColorMode
          w='3em' h='3em' position="absolute" bottom="6em" left="0px"
          dark={{ children: <SunIcon/> }} light={{ children: <MoonIcon/> }}
        />
        <Button w='3em' h='3em' position="absolute" bottom="3em" left="0px">
          <Status/>
        </Button>
        <Auth/>
      </GridItem>
      <GridItem area={'main'} overflow="hidden" position="relative">
        {layout === 'c' && <Box w='100%' h='100%'>
        </Box>}
        {layout === 'g' && <Box w='100%' h='100%' bg='white'></Box>}
        {layout === 'f' && <Box w='100%' h='100%' bg='pink'>
        </Box>}
        {layout === 'o' && <Box w='100%' h='100%'>
          <iframe src='https://openchakra.app/' width='100%' height='100%'></iframe>
        </Box>}
      </GridItem>
    </Grid>
  );
  // return (<Flex w="100%" h="100%" position="fixed" l="0%" t="0%">
  //   <Box w='2em' bg='gray.500' overflowX="hidden" overflowY="scroll">
  //   </Box>
  //   <Box flex='1' bg='tomato' overflow="hidden">
  //   </Box>
  // </Flex>);
};

export default function Page({
  defaultPath,
  defaultSsl,
  serverUrl,
  deeplinksUrl,
  appVersion,
  disableConnector,
}: {
  defaultPath: string;
  defaultSsl: boolean;
  serverUrl: string;
  deeplinksUrl: string;
  appVersion: string;
  disableConnector: boolean;
}) {
  const [path, setPath] = useDeepPath(defaultPath);
  const [ssl, setSsl] = useState(defaultSsl);
  const [portal, setPortal] = useState(true);

  return (
    <DeepNamespaceProvider>
      <MinilinksProvider>
        {!!path && <>
          {/* <CyberDeepProvider namespace="cyber"/> */}
          {/* <AutoGuest/> */}
        </>}
        <Content/>
      </MinilinksProvider>
    </DeepNamespaceProvider>
  );
};

export async function getStaticProps(arg) {
  const result: any = await i18nGetStaticProps(arg);
  result.props = result?.props || {};
  return result;
}