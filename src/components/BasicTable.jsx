import { Anchor, Button, DropdownButton, MenuItem } from "@itwin/itwinui-react";
import { useDispatch, useSelector } from "react-redux";
import './styles/basicTable.scss'
import { useState } from "react";
import { useEffect } from "react";
import { setLoading, setRateLimit } from "../store/reducers/discussions";
import { getRateLimitData } from "../helper/GitHubAPIs";
import { DIALOGSTATEACTION } from "../store/reducers/dialog";
import ColumnHider from "./ColumnHider";
import { Config } from "../db/Config";
import { sortDataAceOrDCE } from "../helper/util";
export const BasicTable = () => {

    let discussionData = useSelector((state) => state.discussions.discussionData);
    const filteredData = useSelector((state) => state.discussions.filteredDiscussionData);
    const isFiltered = useSelector((state) => state.discussions.filter);
    const isDateRangeFilter = useSelector((state) => state.discussions.isDateRangeFilter);
    const isLoading = useSelector((state) => state.discussions.isLoading);
    const isSmartSearch = useSelector((state) => state.discussions.isSmartSearch);
    const dispatch = useDispatch();
    const columnState = useSelector((state) => state.column.columnState);
    const lastCol = useSelector((state) => state.column.lastCol);

    const [data, setData] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(50)

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

    const [dataLength, setDataLength] = useState(0);
    const firstIndex = 1;
    const [lastIndex, setLastIndex] = useState(0);
    const [Indexes, setIndexes] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(1);
    const [sortedData, setSortedData] = useState([]);

    const slideWindow = (currIndex) => {
        if (currIndex > lastIndex) currIndex = lastIndex;
        if (currIndex < firstIndex) currIndex = firstIndex;

        // if current index was 2nd in list update list 
        let first = currIndex - 4;
        let last = currIndex + 4;

        if (first <= firstIndex) {
            first = firstIndex + 1;
        }
        if (last >= lastIndex) {
            last = lastIndex - 1;
        }

        const newIndexes = [];
        for (var i = first; i <= last; i++) {
            newIndexes.push(i);
        }

        setIndexes(newIndexes)
    }


    const handleClick = (rows, close) => () => {
        setRowsPerPage(rows)
        close();

        //update Indexes ...
        const numberOfIndexes = Math.ceil(dataLength / rows);
        setLastIndex(numberOfIndexes);
        const initialIndex = [];
        if (numberOfIndexes - 2 > 0) {
            for (var i = 2; (numberOfIndexes > i && i <= 6); i++) {
                initialIndex.push(i);
            }
            setIndexes(initialIndex)
        }
        else {
            setIndexes({})
        }

        setCurrentIndex(firstIndex)
    };

    const menuItems = (close) => {
        return [25, 50, 100].map((size, index) => <MenuItem key={index} onClick={handleClick(size, close)}>{size} per page</MenuItem>);
    }

    const simplifyDataForTable = (rawDiscussionData) => {
        const simplifiedData = rawDiscussionData.map((data, index) => {


            //Comments & Replies 
            const totalComment = data.comments?.nodes.length;
            let totalReplies = 0;
            data.comments.nodes.forEach(comment => {
                totalReplies += comment.replies.totalCount;
            });

            // AnsweredBy 
            const answeredBy = data.answer?.author.DeveloperAnswered;

            // closed 
            const answeredCreatedAy = new Date(data.answer?.AnswerCreatedAt).toLocaleString();
            const createdAt = new Date(data.createdAt).toLocaleString();
            const updatedAt = new Date(data.updatedAt).toLocaleString();

            //cellColor 
            const statusCell = data.answer ? answeredBy : (totalComment !== 0 ? 'Commented' : "No Reply")

            const status = answeredBy ? answeredBy : statusCell;


            return {
                id: index,
                title: data.title,
                titleUrl: data.DiscussionUrl,
                repoName: data.repoName,
                tagsAndUrl: data.tagsAndUrl,
                developerQuestioned: data.author.DeveloperQuestioned,
                developerQuestionedUrl: data.author.DeveloperQuestionedGithubUrl,
                category: data.category.categoryName,
                categoryWithEmoji: <span style={{ display: 'flex' }} ><span dangerouslySetInnerHTML={{ __html: data.category.emojiHTML }} /><span style={{ marginLeft: '10px' }}>{data.category.categoryName}</span></span>,
                totalComment,
                totalReplies,
                status,
                statusWithColorAndRef: answeredBy ? <Anchor href={data.answer?.AnswerUrl} target="_blank">{answeredBy}</Anchor> : statusCell,
                statusBackgroundColor: getCellColor(statusCell),
                closeDate: answeredCreatedAy !== 'Invalid Date' ? answeredCreatedAy : '',
                updatedAt,
                createdAt
            }
        })

        return simplifiedData;
    }

    const updateData = (data) => {
        const end = currentIndex * rowsPerPage;
        const start = end - rowsPerPage;
        const newDataSet = data.slice(start, end);



        setData(newDataSet);

        // When Repository changes then set currentIndex to 1 
        if (Math.ceil(data.length / rowsPerPage) !== lastIndex) setCurrentIndex(1);

        setTimeout(() => {
            dispatch(setLoading({ isLoading: false }));
        }, (newDataSet.length * 1.5));
    }

    const intelligenceDialogAction = (currDiscussionUrl, tagsAndUrl, title) => {
        dispatch(DIALOGSTATEACTION({
            newState: {
                id: 'intelligenceDialog',
                title,
                currDiscussionUrl,
                tagsAndUrl,
                isOpen: true
            }
        }))
    }

    useEffect(() => {
        updateData(sortedData)
    }, [sortedData, currentIndex, rowsPerPage])

    useEffect(() => {
        if (isSmartSearch.status) {
            setDataLength(isSmartSearch.data.length);
            const simplifiedData = simplifyDataForTable(isSmartSearch.data);
            setSortedData(simplifiedData);
        }
        else if (isFiltered.isAny || isDateRangeFilter) {
            setDataLength(filteredData.length);
            const simplifiedData = simplifyDataForTable(filteredData);
            setSortedData(simplifiedData);
        } else {
            setDataLength(discussionData.length);
            const simplifiedData = simplifyDataForTable(discussionData);
            setSortedData(simplifiedData);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [discussionData, isFiltered, filteredData, isSmartSearch])


    useEffect(() => {
        // update RateLimits 
        getRateLimitData().then((data) => {
            dispatch(setRateLimit({ rateLimit: data.data?.rateLimit }));
        })

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [discussionData])

    useEffect(() => {
        const numberOfIndexes = Math.ceil(dataLength / rowsPerPage);
        setLastIndex(numberOfIndexes);
        const initialIndex = [];
        if (numberOfIndexes - 2 > 0)
            for (var i = 2; (numberOfIndexes > i && i <= 6); i++) {
                initialIndex.push(i);
            }
        setIndexes(initialIndex)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataLength, rowsPerPage])

    const sortData = (accessor, order) => {
        const newSortedData = sortDataAceOrDCE(sortedData, accessor, order);
        setSortedData([...newSortedData])
    }

    const incrementAndDecrementColumnHeader = (colName, accessor) => {
        return <div style={{ display: 'inline-block', position: 'relative', top: '12px', padding: '8px' }}>
            <tr  >
                <th ><div >{colName}</div></th>
                <th style={{ position: 'relative', top: '-10px' }}>
                    <tr style={{ display: 'flex', flexDirection: 'column', marginLeft: '8px' }}>
                        <th onClick={() => sortData(accessor, 'ACE')} style={{ cursor: 'pointer', fontSize: '10px', margin: '-8px 0' }} > &#9650;</th>
                        <th onClick={() => sortData(accessor, 'DCE')} style={{ cursor: 'pointer', fontSize: '10px', }} > &#9660;</th>
                    </tr>
                </th>
            </tr>
        </div>
    }

    return (
        <div style={{ height: '100%' }}>
            <div id='main-table' style={{ height: '90%', overflowY: 'scroll' }}>

                <table style={{ width: "100%" }}>
                    <thead>
                        <tr >
                            <th width={'2%'}>SL</th>
                            {columnState.title && <th width={'24%'}>{incrementAndDecrementColumnHeader('Title', 'title')}</th>}
                            {columnState.repository && <th width={'10%'} >{incrementAndDecrementColumnHeader('Repository', 'repoName')}</th>}
                            {columnState.questionBy && <th width={'13%'}>{incrementAndDecrementColumnHeader('Question By', 'developerQuestioned')}</th>}
                            {columnState.category && <th width={'9%'} >{incrementAndDecrementColumnHeader('Category', 'category')} </th>}
                            {columnState.comments && <th width={'5%'}>{incrementAndDecrementColumnHeader('Comments', 'totalComment')}</th>}
                            {columnState.replies && <th width={'5%'}>{incrementAndDecrementColumnHeader('Replies', 'totalReplies')}</th>}
                            {columnState.status && <th width={'9%'}>{incrementAndDecrementColumnHeader('Status', 'status')}</th>}
                            {columnState.closed && <th width={'7%'}>{incrementAndDecrementColumnHeader('Closed', 'closeDate')}</th>}
                            {columnState.updated && <th width={'7%'}>{incrementAndDecrementColumnHeader('Updated', 'updatedAt')}</th>}
                            {columnState.created && <th width={'7%'}>{incrementAndDecrementColumnHeader('Created', 'createdAt')}</th>}
                            <th style={{ textAlign: 'end' }} width={'1%'}><ColumnHider /></th>

                        </tr>
                    </thead>{
                        isLoading ? <tbody><tr><td style={{ position: 'absolute', top: '50%', left: '50%' }}>Loding...</td></tr></tbody> :
                            <>
                                {data?.length === 0 ? <tbody><tr ><td style={{ position: 'absolute', top: '50%', left: '50%', color: 'red', fontWeight: '600', fontSize: '1.25rem' }}>No Data</td></tr></tbody> :
                                    <tbody className="list-table-body" >
                                        {
                                            data.map((data, index) => {
                                                return <tr key={data.id} className="data-row">
                                                    <td width={'2%'}>{(currentIndex - 1) * rowsPerPage + index + 1}</td>
                                                    {columnState.title && <td colSpan={lastCol === 'title' ? 2 : 1} width={'24%'}>
                                                        <table style={{ width: '100%' }}>
                                                            <tbody>
                                                                <tr style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <td className="title-tags-col" style={{ backgroundColor: `${isSmartSearch.col === 2 ? '#edfaff' : 'none'} ` }} ><Anchor href={data.titleUrl} target="_blank">{data.title}</Anchor></td>
                                                                    {Config.FIND_MATCH && <td className="title-tags-col"> <Button styleType='cta' size="small" onClick={() => intelligenceDialogAction(data.titleUrl, data.tagsAndUrl, data.title)} width='20%'>Matches</Button></td>}
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>}
                                                    {columnState.repository && <td colSpan={lastCol === 'repository' ? 2 : 1} style={{ backgroundColor: `${isSmartSearch.col === 3 ? '#edfaff' : 'none'} ` }} className="align-col-text-center" width={'10%'} > {data.repoName}</td>}
                                                    {columnState.questionBy && <td colSpan={lastCol === 'questionBy' ? 2 : 1} style={{ backgroundColor: `${isSmartSearch.col === 4 ? '#edfaff' : 'none'} ` }} className="align-col-text-center" width={'15%'}><Anchor href={data.developerQuestionedUrl} target="_blank">{data.developerQuestioned}</Anchor></td>}
                                                    {columnState.category && <td colSpan={lastCol === 'category' ? 2 : 1} style={{ backgroundColor: `${isSmartSearch.col === 5 ? '#edfaff' : 'none'} ` }} className="align-col-text-center" width={'10%'} > {data.categoryWithEmoji}</td>}
                                                    {columnState.comments && <td colSpan={lastCol === 'comments' ? 2 : 1} style={{ backgroundColor: `${isSmartSearch.col === 6 ? '#edfaff' : 'none'} ` }} className="align-col-text-center" width={'5%'} >{data.totalComment}</td>}
                                                    {columnState.replies && <td colSpan={lastCol === 'replies' ? 2 : 1} style={{ backgroundColor: `${isSmartSearch.col === 7 ? '#edfaff' : 'none'} ` }} className="align-col-text-center" width={'5%'}>{data.totalReplies}</td>}
                                                    {columnState.status && <td colSpan={lastCol === 'status' ? 2 : 1} /*style={{ backgroundColor: `${isSmartSearch.col === 8 ? '#edfaff' : 'none'} ` }}*/ width={'9%'} style={{ backgroundColor: `${data.statusBackgroundColor}` }}>{data.statusWithColorAndRef}</td>}
                                                    {columnState.closed && <td colSpan={lastCol === 'closed' ? 2 : 1} style={{ backgroundColor: `${isSmartSearch.col === 9 ? '#edfaff' : 'none'} ` }} width={'7%'}>{data.closeDate}</td>}
                                                    {columnState.updated && <td colSpan={lastCol === 'updated' ? 2 : 1} style={{ backgroundColor: `${isSmartSearch.col === 10 ? '#edfaff' : 'none'} ` }} width={'7%'}>{data.updatedAt}</td>}
                                                    {columnState.created && <td colSpan={lastCol === 'created' ? 2 : 1} style={{ backgroundColor: `${isSmartSearch.col === 11 ? '#edfaff' : 'none'} ` }} width={'7%'}>{data.createdAt}</td>}

                                                </tr>
                                            })
                                        }
                                    </tbody>
                                }
                            </>
                    }
                </table>

            </div >

            <div className="table-nav" style={{ height: '10%', overflow: 'hidden', background: '#565e61' }}>
                <div style={{ height: '100%', overflow: 'hidden' }}>
                    <nav style={{}}>
                        <ul className="pagination">
                            <li className="page-item step-button">
                                <button href="#" className="page-link" onClick={() => { if (currentIndex !== firstIndex) { setCurrentIndex(currentIndex - 1); slideWindow(currentIndex - 1); } }}>Prev</button>
                            </li>


                            <li className={`page-item ${currentIndex === firstIndex ? "active" : ''}`} >
                                <button href="#" className="page-item" onClick={() => { setCurrentIndex(firstIndex); slideWindow(firstIndex); }}>{firstIndex}</button>
                            </li>

                            {(Indexes.length > 0 && Indexes[0] !== firstIndex + 1) && <div style={{ color: 'white', paddingTop: '4px', fontSize: '1rem' }}>...</div>}
                            {
                                Indexes.length > 0 && <>
                                    {
                                        Indexes.map((num, index) => (
                                            <li className={`page-item ${currentIndex === Indexes[index] ? "active" : ''}`} key={index}>
                                                <button href="#" className="page-item" onClick={(e) => { setCurrentIndex(Indexes[index]); slideWindow(Indexes[index]); }}>{Indexes[index]}</button>
                                            </li>
                                        ))
                                    }
                                </>
                            }
                            {Indexes.length > 0 && Indexes[Indexes.length - 1] !== lastIndex - 1 && <div style={{ color: 'white', paddingTop: '4px', fontSize: '1rem' }}>...</div>}

                            {dataLength > rowsPerPage && <li className={`page-item ${currentIndex === lastIndex ? "active" : ''}`} >
                                <button href="#" className="page-item" onClick={() => { setCurrentIndex(lastIndex); slideWindow(lastIndex); }}>{lastIndex}</button>
                            </li>}


                            <li className="page-item step-button">
                                <button href="#" className="page-link" onClick={() => { if (currentIndex !== lastIndex) { setCurrentIndex(currentIndex + 1); slideWindow(currentIndex + 1); } }}>Next</button>
                            </li>
                        </ul>
                    </nav>
                    <div className="paginator-dropdown">
                        <div>Rows per page</div>
                        <div>
                            <DropdownButton
                                menuItems={menuItems}
                                size="small"
                                style={{
                                    backgroundColor: '#565e61',
                                    color: 'white',
                                    border: '1px solid whitesmoke',
                                    marginLeft: '5px',
                                }}
                            >
                                {rowsPerPage}
                            </DropdownButton>
                        </div>
                    </div>
                    <div className="row-data-info">
                        <div>{`Rows From - ${(currentIndex - 1) * rowsPerPage + 1} to ${currentIndex * rowsPerPage} of ( ${dataLength} )`}</div>
                    </div>
                </div>
            </div>
        </div >
    );
};