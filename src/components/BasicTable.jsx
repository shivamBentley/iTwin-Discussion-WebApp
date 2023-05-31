import { Anchor, Headline } from "@itwin/itwinui-react";
import { useSelector } from "react-redux";
import './styles/basicTable.scss'
import { useState } from "react";
import { useEffect } from "react";
export const BasicTable = () => {

    const discussionData = useSelector((state) => state.discussions.discussionData);
    const filteredData = useSelector((state) => state.discussions.filteredDiscussionData);
    const isFiltered = useSelector((state) => state.discussions.filter);
    const isLoading = useSelector((state) => state.discussions.isLoading);

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

    }, [discussionData, isFiltered, filteredData])

    return (
        <div id='main-table'>

            <table style={{ width: "100%" }}>
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
                </thead>{
                    isLoading ? <p
                        style={{ position: 'absolute', top: '50%', left: '50%' }}>Loding...</p> :
                        <>
                            {data?.length === 0 ? <p style={{ position: 'absolute', top: '50%', left: '50%', color: 'red', fontWeight: '600', fontSize: '1.25rem' }}>No Data</p> :
                                <tbody className="list-table-body" >
                                    {
                                        data.map((data, index) => {
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
                            }</>
                }
            </table>
            <div style={{ position: 'absolute', bottom: '1%', right: '2%', color: 'blue' }}>
                <Headline style={{ fontSize: '1.25rem', fontWeight: '400' }}>Total Rows - {data.length}</Headline>
            </div>
        </div>
    );
};