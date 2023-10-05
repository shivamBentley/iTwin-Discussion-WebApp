// import { Anchor } from '@itwin/itwinui-react';
import React, { useEffect, useState } from 'react'
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import { useSelector } from 'react-redux';
// import { CSVLink } from 'react-csv';
import { Anchor } from '@itwin/itwinui-react';

function ExportToExcel() {

    const discussionData = useSelector((state) => state.discussions.discussionData);
    const filteredData = useSelector((state) => state.discussions.filteredDiscussionData);
    const isDateRangeFilter = useSelector((state) => state.discussions.isDateRangeFilter);
    const isFiltered = useSelector((state) => state.discussions.filter);
    const columnState = useSelector((state) => state.column.columnState);
    const [csvData, setCsvData] = useState([]);


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

    // const downloadInCSV = (data) => {
    //     const csvInputData = data?.map((data, index) => {
    //         //Comments & Replies 
    //         const totalComment = data.comments.nodes.length;
    //         let totalReplies = 0;
    //         data.comments.nodes.forEach(comment => {
    //             totalReplies += comment.replies.totalCount;
    //         });

    //         // Status 
    //         const answeredBy = data.answer?.author.DeveloperAnswered;

    //         // closed 
    //         const answeredCreatedAy = new Date(data.answer?.AnswerCreatedAt).toLocaleString();
    //         const createdAt = new Date(data.createdAt).toLocaleString();
    //         const updatedAt = new Date(data.updatedAt).toLocaleString();

    //         //cellColor 
    //         const statusCell = data.answer ? answeredBy : (totalComment !== 0 ? 'Commented' : "No Reply")

    //         return {
    //             title: data.title,
    //             repository: data.repoName,
    //             author: data.author.DeveloperQuestioned,
    //             category: data.category.categoryName,
    //             comments: totalComment,
    //             replies: totalReplies,
    //             answeredBy: statusCell,
    //             closedAt: answeredCreatedAy === "Invalid Date" ? "" : answeredCreatedAy,
    //             updatedAt,
    //             createdAt
    //         }
    //     })
    //     setCsvData(csvInputData)
    // }

    useEffect(() => {
        if (isFiltered.isAny || isDateRangeFilter) {
            setData(filteredData);
            // downloadInCSV(filteredData)
        } else {
            setData(discussionData);
            // downloadInCSV(discussionData)
        }
    }, [filteredData, discussionData, isFiltered, isDateRangeFilter])

    return (
        <div>
            <ReactHTMLTableToExcel
                id="test-table-xls-button"
                className="download-table-xls-button"
                table="table-to-xls"
                filename={`iTwinGitHubQueryData(${new Date().toLocaleDateString()})`}
                sheet="tablexls"
                buttonText="Download" />
            <table id="table-to-xls" style={{ display: 'none' }}>
                <thead>
                    <tr>
                        <th width={'2%'}>SL</th>
                        {columnState.title && <th width={'23%'}>Title</th>}
                        {columnState.repository && <th width={'10%'}>Repository</th>}
                        {columnState.questionBy && <th width={'13%'}>Question By</th>}
                        {columnState.category && <th width={'9%'} > Category</th>}
                        {columnState.comments && <th width={'5%'}>Comments</th>}
                        {columnState.replies && <th width={'5%'}>Replies</th>}
                        {columnState.status && <th width={'9%'}>Status</th>}
                        {columnState.closed && <th width={'7%'}>Closed</th>}
                        {columnState.updated && <th width={'7%'}>Updated</th>}
                        {columnState.created && <th width={'7%'}>Created</th>}
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
                            const answeredCreatedAy = new Date(data.answer?.AnswerCreatedAt).toLocaleString();
                            const createdAt = new Date(data.createdAt).toLocaleString();
                            const updatedAt = new Date(data.updatedAt).toLocaleString();

                            //cellColor 
                            const statusCell = data.answer ? answeredBy : (totalComment !== 0 ? 'Commented' : "No Reply")

                            return <tr key={index}>
                                <td width={'2%'}>{index + 1}</td>
                                {columnState.title && <td width={'23%'}><Anchor href={data.DiscussionUrl} target="_blank">{data.title}</Anchor></td>}
                                {columnState.repository && <td className="align-col-text-center" width={'10%'} > {data.repoName}</td>}
                                {columnState.questionBy && <td className="align-col-text-center" width={'15%'}><Anchor href={data.author.DeveloperQuestionedGithubUrl} target="_blank">{data.author.DeveloperQuestioned}</Anchor></td>}
                                {columnState.category && <td className="align-col-text-center" width={'10%'} >{data.category.categoryName}</td>}
                                {columnState.comments && <td className="align-col-text-center" width={'5%'} >{totalComment}</td>}
                                {columnState.replies && <td className="align-col-text-center" width={'5%'}>{totalReplies}</td>}
                                {columnState.status && <td width={'10%'} style={{ backgroundColor: `${getCellColor(statusCell)}` }}>{answeredBy ? <Anchor href={data.answer?.AnswerUrl} target="_blank">{answeredBy}</Anchor> : statusCell}</td>}
                                {columnState.closed && <td width={'10%'}>{answeredCreatedAy !== 'Invalid Date' ? answeredCreatedAy : ''}</td>}
                                {columnState.updated && <td width={'10%'}>{updatedAt}</td>}
                                {columnState.created && <td width={'10%'}>{createdAt}</td>}
                            </tr>
                        })
                    }
                </tbody>
            </table>

            {/* <CSVLink data={csvData}>Download CSV</CSVLink> */}
        </div>
    )
}

export default ExportToExcel