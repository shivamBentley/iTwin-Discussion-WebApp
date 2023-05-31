import { Anchor } from '@itwin/itwinui-react';
import React, { useEffect, useState } from 'react'
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import { useSelector } from 'react-redux';

function ExportToExcel() {

    const discussionData = useSelector((state) => state.discussions.discussionData);
    const filteredData = useSelector((state) => state.discussions.filteredDiscussionData);
    const isFiltered = useSelector((state) => state.discussions.filter);
    const repositoryName = useSelector((state) => state.discussions.repositoryName);


    const [data, setData] = useState([]);

    const getCellColor = (type) => {
        switch (type) {
            case 'Commented':
                return 'skyblue'
            case 'No Reply':
                return '#ED2B2A'
            default:
                return '#82CD47'
        }
    }

    useEffect(() => {
        if (isFiltered.isAny) {
            setData(filteredData);
        } else {
            setData(discussionData);
        }

    }, [filteredData, discussionData, isFiltered])

    return (
        <div>
            <ReactHTMLTableToExcel
                id="test-table-xls-button"
                className="download-table-xls-button"
                table="table-to-xls"
                filename={`${repositoryName}`}
                sheet="tablexls"
                buttonText="Download" />
            <table id="table-to-xls" style={{ display: 'none' }}>
                <thead>
                    <tr>
                        <th width={'2%'}>SL</th>
                        <th width={'23%'}>Title</th>
                        <th width={'15%'}>Question By</th>
                        <th width={'10%'}>Comments</th>
                        <th width={'10%'}>Replies</th>
                        <th width={'10%'}>Status</th>
                        <th width={'10%'}>Closed</th>
                        <th width={'10%'}>Updated</th>
                        <th width={'10%'}>Created</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        data?.map((data, index) => {
                            //Comments & Replies 
                            const totalComment = data.comments.nodes.length;
                            let totalReplies = 0;
                            data.comments.nodes.forEach(comment => {
                                totalReplies += comment.replies.totalCount;
                            });

                            // Status 
                            const answeredBy = data.answer?.author.DeveloperAnswered;

                            // closed 
                            const answeredCreatedAy = new Date(data.answer?.AnswerCreatedAt).toLocaleString(undefined, { timeZone: 'UTC' });
                            const createdAt = new Date(data.createdAt).toLocaleString(undefined, { timeZone: 'UTC' });
                            const updatedAt = new Date(data.updatedAt).toLocaleString(undefined, { timeZone: 'UTC' });

                            //cellColor 
                            const statusCell = data.answer ? answeredBy : (totalComment !== 0 ? 'Commented' : "No Reply")

                            return <tr key={index}>
                                <td width={'2%'}>{index + 1}</td>
                                <td width={'23%'}><Anchor href={data.DiscussionUrl} target="_blank">{data.title}</Anchor></td>
                                <td className="align-col-text-center" width={'15%'}><Anchor href={data.author.DeveloperQuestionedGithubUrl} target="_blank">{data.author.DeveloperQuestioned}</Anchor></td>
                                <td className="align-col-text-center" width={'10%'} >{totalComment}</td>
                                <td className="align-col-text-center" width={'10%'}>{totalReplies}</td>
                                <td width={'10%'} style={{ backgroundColor: `${getCellColor(statusCell)}` }}>{answeredBy ? <Anchor href={data.answer?.AnswerUrl} target="_blank">{answeredBy}</Anchor> : statusCell}</td>
                                <td width={'10%'}>{answeredCreatedAy !== 'Invalid Date' ? answeredCreatedAy : ''}</td>
                                <td width={'10%'}>{createdAt}</td>
                                <td width={'10%'}>{updatedAt}</td>
                            </tr>
                        })
                    }
                </tbody>
            </table>
        </div>
    )
}

export default ExportToExcel