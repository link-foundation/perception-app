import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import * as fs from "fs";

async function insertOpenAiHandler(){
    const deep = new DeepClient({ deep: guestDeep, ...admin });
    export const PACKAGE_NAME = `@deep-foundation/deep-openai`
    const anyTypeLinkId = await deep.id(PACKAGE_NAME, "Any");
    const userTypeLinkId=await deep.id(PACKAGE_NAME, "User")
    const userLinkId=await deep.id(PACKAGE_NAME, "User")
    const typeTypeLinkId = await deep.id(PACKAGE_NAME, "Type");
    const syncTextFileTypeLinkId = await deep.id(PACKAGE_NAME, "SyncTextFile")
    const containTypeLinkId = await deep.id(PACKAGE_NAME, "Contain")
    const fileWithCodeOfHandlerName = "FileWithCodeOfHandlerName";
    const supportsJsLinkId = await deep.id(PACKAGE_NAME, "dockerSupportsJs" /* | "plv8SupportsJs" */)
    const handlerTypeLinkId = await deep.id(PACKAGE_NAME, "Handler")
    const handlerName = "HandlerName";
    const handleOperationLinkId = await deep.id(PACKAGE_NAME, "HandleInsert" /* | HandleUpdate | HandleDelete */);
    const handleName = "HandleName";
    const triggerTypeLinkId=(PACKAGE_NAME, "openAiRequestTypeLinkId")
    const packageLinkId = await deep.id(PACKAGE_NAME, "Package");

    const installPackage = async () => {
        const apolloClient = generateApolloClient({
            path: process.env.NEXT_PUBLIC_GQL_PATH || '', // <<= HERE PATH TO UPDATE
            ssl: !!~process.env.NEXT_PUBLIC_GQL_PATH.indexOf('localhost')
                ? false
                : true,
        });
    }
        const unloginedDeep = new DeepClient({ apolloClient });
        const guest = await unloginedDeep.guest();
        const guestDeep = new DeepClient({ deep: unloginedDeep, ...guest });
        const admin = await guestDeep.login({
            linkId: await guestDeep.id('deep', 'admin'),
        });

    const code = fs.readFileSync('packages/sdk/imports/handler-openai/value-handler.js', {encoding: 'utf-8'});

    const { data: [{id:userInputLinkId}] } = await deep.insert({
        type_id:syncTextFileTypeLinkId,
        string: { data: { value: "user input" } },
        in: {
            data: {
                type_id: containTypeLinkId,
                from_id: userLinkId,
            },
        }
    })

    const { data: [{id:openAiRequestTypeLinkId}] } = await deep.insert({
        type_id: typeTypeLinkId,
        from_id: userTypeLinkId,
        to_id: anyTypeLinkId,
        in: {
            data: {
                type_id: containTypeLinkId,
                from_id: packageLinkId,
                string: {data: { value: "OpenAiRequestTypeLinkId"}}
            },
        }
    });

    const { data: [{ id: openAiApiKeyLinkId, }] } = await deep.insert({
        type_id: typeTypeLinkId,
        in: {
            data: {
                type_id: containTypeLinkId,
                from_id: packageLinkId,
                string: {data: { value: "OpenAiApiKeyLinkId"}}
            },
        }
    });

    const { data: [{ id: openAiApiKeyTypeLinkId }] } = await deep.insert({
        type_id: openAiApiKeyLinkId,
        string: { data: { value: "api key" } },
        in: {
            data: {
                type_id: containTypeLinkId,
                from_id: userLinkId,
            },
        }
    });

    await deep.insert({
        type_id: syncTextFileTypeLinkId,
        in: {
            data: [
                {
                    type_id: containTypeLinkId,
                    from_id: packageLinkId, // before created package
                    string: {data: {value: fileWithCodeOfHandlerName}},
                },
                {
                    from_id: supportsJsLinkId,
                    type_id: handlerTypeLinkId,
                    in: {
                        data: [
                            {
                                type_id: containTypeLinkId,
                                from_id: packageLinkId, // before created package
                                string: {data: {value: handlerName}},
                            },
                            {
                                type_id: handleOperationLinkId,
                                // The type of link which operation will trigger handler. Example: insert handle will be triggered if you insert a link with this type_id
                                from_id: triggerTypeLinkId,
                                in: {
                                    data: [
                                        {
                                            type_id: containTypeLinkId,
                                            from_id: packageLinkId, // before created package
                                            string: {data: {value: handleName}},
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            ],
        },
        string: {
            data: {
                value: code,
            },
        },
    });
}