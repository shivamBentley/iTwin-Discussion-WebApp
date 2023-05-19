import { Anchor } from '@itwin/itwinui-react';
import React from 'react'
import ReactHTMLTableToExcel from 'react-html-table-to-excel';


function ExportToExcel({ discussionData , filename}) {


    const getStatus = (obj) => {
        const answeredBy = obj.answer?.author.DeveloperAnswered;
        const utcTimeString = obj.answer?.AnswerCreatedAt;
        const answeredCreatedAy = new Date(utcTimeString);

        const answeredCreatedAyInLocalTime = answeredCreatedAy.toLocaleString(undefined, { timeZone: 'UTC' });
        return <>
            {
                obj.answer ? <div style={{ color: '#82CD47' }}>
                    <Anchor href={obj.answer.AnswerUrl} target="_blank">Answered by {answeredBy} </Anchor>
                    <p >{answeredCreatedAyInLocalTime}</p>
                </div>
                    : (
                        obj.comments.totalCount !== 0 ? <div style={{ color: 'skyblue' }}>Commented</div>
                            : <div style={{ color: '#ED2B2A' }}>No Reply</div>
                    )
            }
        </>;
    }



    return (
        <div>
            <ReactHTMLTableToExcel
                id="test-table-xls-button"
                className="download-table-xls-button"
                table="table-to-xls"
                filename= { filename}
                sheet="tablexls"
                buttonText="Download" />
            <table id="table-to-xls" style={{ display: 'none' }}>
                <tr>
                    <th>Title</th>
                    <th>Question BY</th>
                    <th>Comments & Replies</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Updated</th>
                </tr>
                {
                    discussionData.map((obj) => {
                        const totalComment = obj.comments?.totalCount;
                        let totalReplies = 0;
                        obj.comments.nodes.forEach(comment => {
                            totalReplies += comment.replies.totalCount;
                        });
                        const isAnswer = obj.answer?.isAnswer
                        const answeredBy = obj.answer?.author.DeveloperAnswered;

                        return <tr>
                            <td>{<Anchor href={obj.DiscussionUrl} target="_blank">{obj.title}</Anchor>}</td>
                            <td>{<Anchor href={obj.author.DeveloperQuestionedGithubUrl} target="_blank">{obj.author.DeveloperQuestioned} </Anchor>}</td>
                            <td>{`Comments (${totalComment}) - Replies (${totalReplies})`}</td>
                            <td> {getStatus(obj)}</td>
                            <td>{obj.createdAt}</td>
                            <td>{obj.updatedAt}</td>
                        </tr>
                    })
                }
            </table>
        </div>
    )
}

export default ExportToExcel