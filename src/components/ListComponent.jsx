import { Table, Anchor, TablePaginator, tableFilters } from '@itwin/itwinui-react'
import React, { useMemo, useCallback } from 'react'
import './styles/tableStyle.scss';

function ListComponent({ discussionData, isLoading }) {

    const columns = useMemo(
        () => [
            {
                Header: 'Table',
                columns: [
                    {
                        id: 'title',
                        Header: 'Title',
                        Filter: tableFilters.TextFilter(),
                        Cell: (props) => {
                            return <Anchor href={props.row.original.DiscussionUrl} target="_blank">{props.row.original.title}</Anchor>;
                        },
                    },
                    {
                        id: 'questionBy',
                        Header: 'Question By',
                        Filter: tableFilters.TextFilter(),
                        Cell: (props) => {
                            return <Anchor href={props.row.original.author.DeveloperQuestionedGithubUrl} target="_blank">{props.row.original.author.DeveloperQuestioned}</Anchor>;
                        },
                    },
                    {
                        id: 'Comments',
                        Header: 'Comments & Replies',
                        Filter: tableFilters.TextFilter(),
                        Cell: (props) => {
                            const totalComment = props.row.original.comments.nodes.length;
                            let totalReplies = 0;
                            props.row.original.comments.nodes.forEach(comment => {
                                totalReplies += comment.replies.totalCount;
                            });
                            return <div className="iot-status-cell" >{`Comments (${totalComment}) - Replies (${totalReplies})`}</div>;
                        },
                    },
                    {
                        id: 'status',
                        Header: 'Status',
                        Filter: tableFilters.TextFilter(),
                        Cell: (props) => {
                            const answeredBy = props.row.original.answer?.author.DeveloperAnswered;
                            const utcTimeString = props.row.original.answer?.AnswerCreatedAt;
                            const answeredCreatedAy = new Date(utcTimeString);

                            const answeredCreatedAyInLocalTime = answeredCreatedAy.toLocaleString(undefined, { timeZone: 'UTC' });
                            return <>
                                {
                                    props.row.original.answer ? <div className="iot-status-cell" style={{ backgroundColor: '#82CD47' }}>
                                        <Anchor href={props.row.original.answer.AnswerUrl} target="_blank">Answered by {answeredBy} </Anchor>
                                        <p className='answered-date'>{answeredCreatedAyInLocalTime}</p>
                                    </div>
                                        : (
                                            props.row.original.comments.totalCount !== 0 ? <div className="iot-status-cell" style={{ backgroundColor: 'skyblue' }}>Commented</div>
                                                : <div className="iot-status-cell" style={{ backgroundColor: '#ED2B2A' }}>No Reply</div>
                                        )
                                }
                            </>;
                        },
                    },
                    {
                        id: 'createdAt',
                        Header: 'Created',
                        Filter: tableFilters.TextFilter(),
                        Cell: (props) => {
                            const utcTimeString = props.row.original.createdAt;
                            const utcDateTime = new Date(utcTimeString);

                            const localDateTime = utcDateTime.toLocaleString(undefined, { timeZone: 'UTC' });
                            return <>{localDateTime}</>;
                        },
                    },
                    {
                        id: 'updatedAt',
                        Header: 'Updated',
                        Filter: tableFilters.TextFilter(),
                        Cell: (props) => {
                            const utcTimeString = props.row.original.updatedAt;
                            const utcDateTime = new Date(utcTimeString);

                            const localDateTime = utcDateTime.toLocaleString(undefined, { timeZone: 'UTC' });
                            return <>{localDateTime}</>;
                        },
                    },
                ],
            },
        ],
        [],
    );

    const pageSizeList = useMemo(() => [25, 50, 100], []);
    const paginator = useCallback(
        (props) => (
            <TablePaginator {...props} pageSizeList={pageSizeList} />
        ),
        [pageSizeList],
    );
    
    return (
        <Table
            data={discussionData}
            columns={columns}
            isLoading={isLoading}
            styleType='zebra-rows'
            emptyTableContent='No data.'
            style={{ height: '80vh' }}
            pageSize={50}
            paginatorRenderer={paginator}
            isSelectable
            isSortable
            isResizable
        />
    )
}

export default ListComponent