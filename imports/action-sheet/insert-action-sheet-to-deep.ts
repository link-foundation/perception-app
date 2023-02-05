import {
  ActionSheet,
  ActionSheetButtonStyle,
  ShowActionsOptions,
} from '@capacitor/action-sheet';
import { DeepClient } from '@deep-foundation/deeplinks/imports/client';
import { getOptionStyleName } from './get-option-style-name';
import { getOptionStyleTypeLinkIds } from './get-option-style-type-link-ids';
import { PACKAGE_NAME } from './package-name';

export async function insertActionSheetToDeep({
  deep,
  actionSheetData,
  containInLinkId
}: {
  deep: DeepClient;
  actionSheetData: ShowActionsOptions;
  containInLinkId: number
}) {
  console.log({actionSheetData});
  
  const syncTextFileTypeLinkId = await deep.id(
    '@deep-foundation/core',
    'SyncTextFile'
  );
  const containTypeLinkId = await deep.id('@deep-foundation/core', 'Contain');
  const actionSheetTypeLinkId = await deep.id(PACKAGE_NAME, 'ActionSheet');
  const actionSheetTitleTypeLinkId = await deep.id(
    PACKAGE_NAME,
    'ActionSheetTitle'
  );
  const actionSheetMessageTypeLinkId = await deep.id(
    PACKAGE_NAME,
    'ActionSheetMessage'
  );
  const optionTypeLinkId = await deep.id(PACKAGE_NAME, 'Option');
  const optionTitleTypeLinkId = await deep.id(PACKAGE_NAME, 'OptionTitle');
  const optionStyleTypeLinkId = await deep.id(PACKAGE_NAME, 'OptionStyle');
  const optionStyleTypeLinkIds = await getOptionStyleTypeLinkIds({ deep });

  await deep.insert([
    {
      type_id: actionSheetTypeLinkId,
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: containInLinkId
        }
      },
      out: {
        data: [
          {
            type_id: actionSheetTitleTypeLinkId,
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: containInLinkId
              }
            },
            to: {
              data: {
                type_id: syncTextFileTypeLinkId,
                in: {
                  data: {
                    type_id: containTypeLinkId,
                    from_id: containInLinkId
                  }
                },
                string: {
                  data: {
                    value: actionSheetData.title,
                  },
                },
              },
            },
          },
          {
            type_id: actionSheetMessageTypeLinkId,
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: containInLinkId
              }
            },
            to: {
              data: {
                type_id: syncTextFileTypeLinkId,
                in: {
                  data: {
                    type_id: containTypeLinkId,
                    from_id: containInLinkId
                  }
                },
                string: {
                  data: {
                    value: actionSheetData.message,
                  },
                },
              },
            },
          },
          ...(await Promise.all(
            actionSheetData.options.map(
              async (option) => (
                {
                  type_id: containTypeLinkId,
                  to: {
                    data: {
                      type_id: optionTypeLinkId,
                      out: {
                        data: [{
                          type_id: optionTitleTypeLinkId,
                          in: {
                            data: {
                              type_id: containTypeLinkId,
                              from_id: containInLinkId
                            }
                          },
                          to: {
                            data: {
                              type_id: syncTextFileTypeLinkId,
                              in: {
                                data: {
                                  type_id: containTypeLinkId,
                                  from_id: containInLinkId
                                }
                              },
                              string: {
                                data: {
                                  value: option.title,
                                },
                              },
                            },
                          },
                        },
                        {
                          type_id: optionStyleTypeLinkId,
                          in: {
                            data: {
                              type_id: containTypeLinkId,
                              from_id: containInLinkId
                            }
                          },
                          to_id:
                            await deep.id(PACKAGE_NAME, `${await getOptionStyleName({
                              style: option.style,
                            })}OptionStyle`),
                        }
                        ]
                      }
                    },
                  },
                }
              )
            )
          ))


        ],
      },
    },
  ]);
}

