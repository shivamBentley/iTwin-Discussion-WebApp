import { DictionaryOfDiscussionData, DictionaryOfTagsWithDeveloperList } from '../../helper/TrieClass';
import { Anchor, Button, Dialog, Headline } from '@itwin/itwinui-react';
import { useState } from 'react';
import '../styles/tagGenerator.scss'

function TagGenerator({ currDiscussionUrl, tagsAndUrl }) {
    const { bodyTags, titleTags } = tagsAndUrl;
    const [isOpen, setIsOpen] = useState(false)
    const [match, setMatch] = useState(null)

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


        // if type === ['title'/'body'].level_1 then make sure discussion url doesn't exit in ['title'/'body'].level_0
        if (str[1] === 'level_1') {
            const isAvailableInLevel_0 = urlMap[str[0]]['level_0'].get(discussionUrl);
            if (isAvailableInLevel_0) return;
        }

        // if url is available in urlMap.title.['level_0'/'level_1] then skip 
        if (str[0] === 'body') {
            const isAvailableInLevel_0 = urlMap['title']['level_0'].get(discussionUrl);
            const isAvailableInLevel_1 = urlMap['title']['level_1'].get(discussionUrl);
            if (isAvailableInLevel_0 || isAvailableInLevel_1) return;
        }

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
            if (ListLevel_0)
                for (const [key, value] of ListLevel_0) {
                    const { answeredUrl, otherUrl } = value;
                    // if exist then merge
                    createUrlMap(type + '.level_0', tag, answeredUrl);
                    createUrlMap(type + '.level_1', tag, otherUrl);
                }
            if (ListLevel_1)
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
        findMatch('body', 'bodyDic', titleTags)

        //sorting urlMap 
        for (const key1 in urlMap) {
            const obj = urlMap[key1];
            for (const key2 in obj) {
                const sortedUrlMap = new Map([...urlMap[key1][key2].entries()].sort((a, b) => b[1].length - a[1].length));
                urlMap[key1][key2] = sortedUrlMap;
            }
        }

        // get discussion data on the basis of url 
        const discussionData = {
            title: {
                level_0: [],
                level_1: []
            },
            body: {
                level_0: [],
                level_1: []
            }
        };

        for (const key1 in discussionData) {
            const obj = discussionData[key1];
            for (const key2 in obj) {
                for (const [key, value] of urlMap[key1][key2]) {
                    discussionData[key1][key2].push(DictionaryOfDiscussionData.search(key.toLowerCase()).data);
                }
            }
        }

        return discussionData
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
                // isDraggable
                // isResizable

                style={{ zIndex: 999 }}
            >
                <Dialog.Main >
                    <Dialog.TitleBar titleText='Suggestion List' />
                    <Dialog.Content>
                        <div className='main-container'>

                            {match && (match.title.level_0.length !== 0 || match.title.level_1.length !== 0) &&
                                <div >
                                    <Headline className="title-header">T-Title Match</Headline>
                                    <div>
                                        {
                                            match.title.level_0.length !== 0 && <>
                                                <p className='sub-heading'>Answered - count({match.title.level_0.length})</p>
                                                <div className='list-block' style={{ maxHeight: '100px', overflowY: 'scroll' }}>
                                                    {
                                                        match.title.level_0.map((data, index) => {
                                                            return <p className='title-link' >
                                                                <span>{index + 1}. </span>
                                                                <Anchor href={data.DiscussionUrl} target="_blank">{data.title}</Anchor>
                                                            </p>
                                                        })
                                                    }
                                                </div>
                                            </>
                                        }
                                        {
                                            match.title.level_1.length !== 0 && <>
                                                <p className='sub-heading'>Unanswered -  count({match.title.level_1.length})</p>
                                                <div className='list-block' style={{ maxHeight: '100px', overflowY: 'scroll' }}>
                                                    {
                                                        match.title.level_1.map((data, index) => {
                                                            return <p className='title-link' >
                                                                <span>{index + 1}. </span>
                                                                <Anchor href={data.DiscussionUrl} target="_blank">{data.title}</Anchor>
                                                            </p>
                                                        })
                                                    }
                                                </div>
                                            </>
                                        }
                                    </div>
                                </div>
                            }
                            {
                                match && (match.body.level_0.length !== 0 || match.body.level_1.length !== 0) &&
                                <div >
                                    <Headline className="title-header">T-Body Match</Headline>
                                    <div>
                                        {
                                            match.body.level_0.length !== 0 && <>
                                                <p className='sub-heading'>Answered -  count({match.body.level_0.length})</p>
                                                <div className='list-block' style={{ maxHeight: '100px', overflowY: 'scroll' }}>
                                                    {
                                                        match.body.level_0.map((data, index) => {
                                                            return <p className='title-link' >
                                                                <span>{index + 1}. </span>
                                                                <Anchor href={data.DiscussionUrl} target="_blank">{data.title}</Anchor>
                                                            </p>
                                                        })
                                                    }
                                                </div>
                                            </>
                                        }
                                        {
                                            match.body.level_1.length !== 0 && <>

                                                <p className='sub-heading'>Unanswered -  count({match.body.level_1.length})</p>
                                                <div className='list-block' style={{ maxHeight: '100px', overflowY: 'scroll' }}>
                                                    {
                                                        match.body.level_1.map((data, index) => {
                                                            return <p className='title-link' >
                                                                <span>{index + 1}. </span>
                                                                <Anchor href={data.DiscussionUrl} target="_blank">{data.title}</Anchor>
                                                            </p>
                                                        })
                                                    }
                                                </div>
                                            </>
                                        }
                                    </div>
                                </div>
                            }
                            {
                                match && (match.title.level_0.length === 0 && match.title.level_1.length === 0) && (match.body.level_0.length === 0 && match.body.level_1.length === 0) && <div className='no-match-container'>
                                    <p className='no-match'>No match found</p>
                                </div>
                            }
                        </div>
                    </Dialog.Content>
                </Dialog.Main>
            </Dialog>
        </>
    )
}

export default TagGenerator