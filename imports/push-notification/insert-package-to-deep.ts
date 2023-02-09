import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { PACKAGE_NAME } from "./package-name";
import { PACKAGE_NAME as DEVICE_PACKAGE_NAME } from "../device/package-name";
import * as fs from 'fs';


export async function insertPackageToDeep({deep}:{deep: DeepClient}) {
  const typeTypeLinkId = await deep.id(
    '@deep-foundation/core',
    'Type'
  );
  const containTypeLinkId = await deep.id(
    '@deep-foundation/core',
    'Contain'
  );
  const packageTypeLinkId = await deep.id(
    '@deep-foundation/core',
    'Package'
  );
  const joinTypeLinkId = await deep.id(
    '@deep-foundation/core',
    'Join'
  );
  const valueTypeLinkId = await deep.id(
    '@deep-foundation/core',
    'Value'
  );
  const stringTypeLinkId = await deep.id(
    '@deep-foundation/core',
    'String'
  );
  const numberTypeLinkId = await deep.id(
    '@deep-foundation/core',
    'Number'
  );
  const objectTypeLinkId = await deep.id(
    '@deep-foundation/core',
    'Object'
  );
  const anyTypeLinkId = await deep.id(
    "@deep-foundation/core",
    "Any"
  )
  const deviceTypeLinkId = await deep.id(
    DEVICE_PACKAGE_NAME,
    'Device'
  );

  const {
    data: [{ id: packageLinkId }],
  } = await deep.insert({
    type_id: packageTypeLinkId,
    string: { data: { value: PACKAGE_NAME } },
    in: {
      data: [
        {
          type_id: containTypeLinkId,
          from_id: deep.linkId,
        },
      ],
    },
    out: {
      data: [
        {
          type_id: joinTypeLinkId,
          to_id: await deep.id('deep', 'users', 'packages'),
        },
        {
          type_id: joinTypeLinkId,
          to_id: await deep.id('deep', 'admin'),
        },
      ],
    },
  });

  const {
    data: [{ id: notificationTypeLinkId }],
  } = await deep.insert([{
    type_id: typeTypeLinkId,
    in: {
      data: {
        type_id: containTypeLinkId,
        from_id: packageLinkId,
        string: { data: { value: 'PushNotification' } },
      },
    },
    out: {
      data: [
        {
          type_id: typeTypeLinkId,
          to_id: anyTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'Title' } },
            },
          },
        },
        {
          type_id: typeTypeLinkId,
          to_id: anyTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'Body' } },
            },
          },
        },
        {
          type_id: typeTypeLinkId,
          to_id: anyTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'IconUrl' } },
            },
          },
        },
        {
          type_id: typeTypeLinkId,
          to_id: anyTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'ImageUrl' } },
            },
          },
        },
        {
          type_id: typeTypeLinkId,
          to_id: anyTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'Subtitle' } },
            },
          },
        },
        {
          type_id: typeTypeLinkId,
          to_id: anyTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'Id' } },
            },
          },
        },
        {
          type_id: typeTypeLinkId,
          to_id: anyTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'Badge' } },
            },
          },
        },
        {
          type_id: typeTypeLinkId,
          to_id: anyTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'Payload' } },
            },
          },
        },
        {
          type_id: typeTypeLinkId,
          to_id: anyTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'ClickAction' } },
            },
          },
        },
        {
          type_id: typeTypeLinkId,
          to_id: anyTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'DeepLink' } },
            },
          },
        },
        {
          type_id: typeTypeLinkId,
          to_id: anyTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'Group' } },
            },
          },
        },
        {
          type_id: typeTypeLinkId,
          to_id: anyTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'IsGroupSummary' } },
            },
          },
        },
        
      ]
    }
  },
  {
    type_id: typeTypeLinkId,
    in: {
      data: {
        type_id: containTypeLinkId,
        from_id: packageLinkId,
        string: { data: { value: 'WebPushCertificate' } },
      },
    },
    out: {
      data: {
        type_id: valueTypeLinkId,
        to_id: stringTypeLinkId,
      },
    },
  },
  {
    type_id: typeTypeLinkId,
    in: {
      data: {
        type_id: containTypeLinkId,
        from_id: packageLinkId,
        string: { data: { value: 'DeviceRegistrationToken' } },
      },
    },
    out: {
      data: {
        type_id: valueTypeLinkId,
        to_id: stringTypeLinkId,
      },
    },
  },
  {
    type_id: typeTypeLinkId,
    in: {
      data: {
        type_id: containTypeLinkId,
        from_id: packageLinkId,
        string: { data: { value: 'ServiceAccount' } },
      },
    },
    out: {
      data: {
        type_id: valueTypeLinkId,
        to_id: objectTypeLinkId,
      },
    },
  }
]);

  const {data: [{id: notifyTypeLinkId}]} = await deep.insert({
    type_id: typeTypeLinkId,
    from_id: await deep.id(PACKAGE_NAME, "PushNotification"),
    to_id: deviceTypeLinkId,
    in: {
      data: {
        type_id: containTypeLinkId,
        from_id: packageLinkId,
        string: { data: { value: 'Notify' } },
      },
    },
  })

  const fileTypeLinkId = await deep.id(
    '@deep-foundation/core',
    'SyncTextFile'
  );
  const fileWithCodeOfHandlerName = 'FileWithCodeOfHandlerName';
  const supportsJsLinkId = await deep.id(
    '@deep-foundation/core',
    'dockerSupportsJs' /* | "plv8SupportsJs" */
  );
  const handlerTypeLinkId = await deep.id(
    '@deep-foundation/core',
    'Handler'
  );
  const handlerName = 'HandlerName';
  const handleOperationLinkId = await deep.id(
    '@deep-foundation/core',
    'HandleInsert' /* | HandleUpdate | HandleDelete */
  );
  const handleName = 'HandleName';
  const code = fs.readFileSync('/workspace/dev/packages/sdk/imports/push-notification/notifyInsertHandler.js', {encoding: 'utf-8'});

  await deep.insert({
    type_id: fileTypeLinkId,
    in: {
      data: [
        {
          type_id: containTypeLinkId,
          from_id: packageLinkId, // before created package
          string: { data: { value: fileWithCodeOfHandlerName } },
        },
        {
          from_id: supportsJsLinkId,
          type_id: handlerTypeLinkId,
          in: {
            data: [
              {
                type_id: containTypeLinkId,
                from_id: packageLinkId, // before created package
                string: { data: { value: handlerName } },
              },
              {
                type_id: handleOperationLinkId,
                // The type of link which operation will trigger handler. Example: insert handle will be triggered if you insert a link with this type_id
                from_id: notifyTypeLinkId,
                in: {
                  data: [
                    {
                      type_id: containTypeLinkId,
                      from_id: packageLinkId, // before created package
                      string: { data: { value: handleName } },
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
};