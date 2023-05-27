import { Anchor, Table } from "@itwin/itwinui-react";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import './styles/basicTable.scss'

export const BasicTable = (args) => {

    const discussionData = useSelector((state) => state.discussions.discussionData)

    const getCellColor = (type) => {
        switch (type) {
            case 'Commented':
                return 'skyblue'
                break;

            case 'No Reply':
                return '#ED2B2A'
                break;

            default:
                return '#82CD47'
                break;
        }
    }

    return (
        <div id='main-table'>
            <table style={{ width: "100%" }}>
                <thead>
                    <tr>
                        <th width={'2%'}>SL</th>
                        <th width={'23%'}>Title</th>
                        <th width={'15%'}>Question BY</th>
                        <th width={'10%'}>Comments</th>
                        <th width={'10%'}>Replies</th>
                        <th width={'10%'}>Status</th>
                        <th width={'10%'}>Closed</th>
                        <th width={'10%'}>Updated</th>
                        <th width={'10%'}>created</th>
                    </tr>
                </thead>
                <tbody className="list-table-body" >
                    {
                        discussionData.map((data, index) => {
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

                            return <tr>
                                <td width={'2%'}>{index + 1}</td>
                                <td width={'23%'}><Anchor href={data.DiscussionUrl} target="_blank">{data.title}</Anchor></td>
                                <td width={'15%'}><Anchor href={data.author.DeveloperQuestionedGithubUrl} target="_blank">{data.author.DeveloperQuestioned}</Anchor></td>
                                <td width={'10%'} >{totalComment}</td>
                                <td width={'10%'}>{totalReplies}</td>
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
    );
};