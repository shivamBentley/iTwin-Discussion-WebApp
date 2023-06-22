import React from 'react'
import { DictionaryOfTagsWithDeveloperList } from '../../helper/TrieClass';
import { Anchor, Button, Dialog, Headline } from '@itwin/itwinui-react';
import { useState } from 'react';

function TagGenerator({ currDiscussionUrl, tagsAndUrl }) {
    const { bodyTags, titleTags } = tagsAndUrl;
    const [isOpen, setIsOpen] = React.useState(false)
    const [match, setMatch] = React.useState(null)

    const urlMap = {
        title: {
            level_0: new Map(),
            level_1: new Map()
        },
        body: {
            level_0: new Map(),
            level_1: new Map()
        },
    }

    const insertInMap = (type, tag, url) => {
        const discussionUrl = url.split('#')[0];
        const str = type.split(".")

        const found = urlMap[str[0]][str[1]].get(discussionUrl);
        let data = new Set([tag]);
        if (found)
            data = new Set([...found, tag]);

        // if the url is not the query, we are searching for 
        if (currDiscussionUrl !== discussionUrl) {
            urlMap[str[0]][str[1]].set(discussionUrl, data);

        }
    }

    const createUrlMap = (type, tag, list) => {
        list.forEach((url) => {
            insertInMap(type, tag, url)
        })
    }

    const findMatch = (type, dictionaryType, tagList) => {
        tagList.forEach((tag) => {
            const searchKey = tag.toLowerCase();
            const { ListLevel_0, ListLevel_1 } = DictionaryOfTagsWithDeveloperList[dictionaryType].search(searchKey)

            for (const [key, value] of ListLevel_0) {
                const { answeredUrl, otherUrl } = value;
                // if exist then merge
                createUrlMap(type + '.level_0', tag, answeredUrl);
                createUrlMap(type + '.level_1', tag, otherUrl);
            }

            for (const [key, value] of ListLevel_1) {
                const { answeredUrl, otherUrl } = value;
                // if exist then merge
                createUrlMap(type + '.level_0', tag, answeredUrl);
                createUrlMap(type + '.level_1', tag, otherUrl);
            }
        })
    }

    const findBodyAndTitleMatch = () => {
        findMatch('title', 'titleDic', titleTags);
        findMatch('body', 'bodyDic', bodyTags)
        return urlMap
    }

    return (
        <>
            <Button styleType='' size='small' onClick={() => {
                const currentMatch = findBodyAndTitleMatch();
                setMatch(currentMatch);
                setIsOpen(true);
            }}>
                Show
            </Button>
            <Dialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                closeOnEsc
                // isDismissible
                isDraggable
                // isResizable

                style={{ zIndex: '9999' }}
            >
                <Dialog.Main style={{ Width: '300px', height: '480px' }}>
                    <Dialog.TitleBar titleText='Filter discussion data' />
                    <Dialog.Content>
                        <div>
                            <div>
                                <Headline className="" style={{ marginTop: '-25px' }}>Title Match</Headline>
                                <div>
                                    {
                                        match && <>
                                            <p>Title match Answered - {match.title.level_0.size}</p>
                                            <div style={{ maxHeight: '100px', overflowY: 'scroll' }}>
                                                {[...match.title.level_0].map(([key, value]) => {
                                                    return <p><Anchor href={key} target="_blank">{key}</Anchor></p>
                                                })}
                                            </div>
                                        </>
                                    }

                                    {
                                        match && <>
                                            <p>Title match unanswered - {match.title.level_1.size}</p>
                                            <div style={{ maxHeight: '100px', overflowY: 'scroll' }}>
                                                {[...match.title.level_1].map(([key, value]) => {
                                                    return <p><Anchor href={key} target="_blank">{key}</Anchor></p>
                                                })}
                                            </div>
                                        </>
                                    }


                                </div>
                            </div>
                        </div>
                    </Dialog.Content>
                </Dialog.Main>
            </Dialog>
        </>
    )
}

export default TagGenerator