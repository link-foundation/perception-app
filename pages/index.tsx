import { useState } from "react";
import { Button, ChakraProvider, Stack, Text } from '@chakra-ui/react';
import {
  DeepProvider,
  useDeep,
} from "@deep-foundation/deeplinks/imports/client";
import { Provider } from "../imports/provider";
import Link from "next/link";



const styles = { height: 60, width: 140, background: "grey" }

function Content() {
  const deep = useDeep();
  const [isauth, setAuth] = useState(false);

  const authUser = async () => {
    await deep.guest();
    const { linkId, token, error } = await deep.login({
      linkId: await deep.id("deep", 'admin')
    })
    token ? setAuth(true) : setAuth(false)
  };

  return (
    <>
      <Text>HELLO FROM DEEP</Text>
    </>
  )
}

export default function Index() {
  return (
    <>
      <ChakraProvider>
        <Provider>
          <DeepProvider>
            <Content />
          </DeepProvider>
        </Provider>
      </ChakraProvider>
    </>
  );
}