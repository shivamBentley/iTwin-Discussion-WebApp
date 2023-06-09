import { Anchor, DropdownButton, MenuItem } from "@itwin/itwinui-react";
import { useDispatch, useSelector } from "react-redux";
import './styles/basicTable.scss'
import { useState } from "react";
import { useEffect } from "react";
import { setLoading, setRateLimit } from "../store/reducers/discussions";
import { getRateLimitData } from "../helper/GitHubAPIs";
export const BasicTable = () => {

    const discussionData = useSelector((state) => state.discussions.discussionData);
    const filteredData = useSelector((state) => state.discussions.filteredDiscussionData);
    const isFiltered = useSelector((state) => state.discussions.filter);
    const isDateRangeFilter = useSelector((state) => state.discussions.isDateRangeFilter);
    const isLoading = useSelector((state) => state.discussions.isLoading);
    const isSmartSearch = useSelector((state) => state.discussions.isSmartSearch);
    const dispatch = useDispatch();

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

    useEffect(() => {
        if (isSmartSearch.status) {
            setDataLength(isSmartSearch.data.length)
            updateData(isSmartSearch.data)
        }

        else if (isFiltered.isAny || isDateRangeFilter) {
            setDataLength(filteredData.length)
            updateData(filteredData)
        } else {
            setDataLength(discussionData.length)
            updateData(discussionData);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [discussionData, isFiltered, filteredData, currentIndex, rowsPerPage, isSmartSearch])


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

    return (
        <div style={{ height: '100%' }}>
            <div id='main-table' style={{ height: '90%', overflowY: 'scroll' }}>

                <table style={{ width: "100%" }}>
                    <thead>
                        <tr>
                            <th width={'2%'}>SL</th>
                            <th width={'23%'}>Title</th>
                            <th width={'15%'}>Question By</th>
                            <th width={'10%'} > Category</th>
                            <th width={'5%'}>Comments</th>
                            <th width={'5%'}>Replies</th>
                            <th width={'10%'}>Status</th>
                            <th width={'10%'}>Closed</th>
                            <th width={'10%'}>Created</th>
                            <th width={'10%'}>Updated</th>

                        </tr>
                    </thead>{
                        isLoading ? <tbody><tr><td style={{ position: 'absolute', top: '50%', left: '50%' }}>Loding...</td></tr></tbody> :
                            <>
                                {data?.length === 0 ? <tbody><tr ><td style={{ position: 'absolute', top: '50%', left: '50%', color: 'red', fontWeight: '600', fontSize: '1.25rem' }}>No Data</td></tr></tbody> :
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
                                                const answeredCreatedAy = new Date(data.answer?.AnswerCreatedAt).toLocaleString();
                                                const createdAt = new Date(data.createdAt).toLocaleString();
                                                const updatedAt = new Date(data.updatedAt).toLocaleString();

                                                //cellColor 
                                                const statusCell = data.answer ? answeredBy : (totalComment !== 0 ? 'Commented' : "No Reply")

                                                //emoji 
                                                const emojiString = data.category.emojiHTML;
                                                const EmojiHTML = <span style={{display:'flex'}} ><span dangerouslySetInnerHTML={{ __html: emojiString }} /><span style={{marginLeft:'10px'}}>{data.category.categoryName}</span></span>


                                                return <tr key={index} className="data-row">
                                                    <td width={'2%'}>{(currentIndex - 1) * rowsPerPage + index + 1}</td>
                                                    <td style={{ backgroundColor: `${isSmartSearch.col === 2 ? '#edfaff' : 'none'} ` }} width={'23%'}><Anchor href={data.DiscussionUrl} target="_blank">{data.title}</Anchor></td>
                                                    <td style={{ backgroundColor: `${isSmartSearch.col === 3 ? '#edfaff' : 'none'} ` }} className="align-col-text-center" width={'15%'}><Anchor href={data.author.DeveloperQuestionedGithubUrl} target="_blank">{data.author.DeveloperQuestioned}</Anchor></td>
                                                    <td style={{ backgroundColor: `${isSmartSearch.col === 4 ? '#edfaff' : 'none'} ` }} className="align-col-text-center" width={'10%'} > {EmojiHTML}</td>
                                                    <td style={{ backgroundColor: `${isSmartSearch.col === 5 ? '#edfaff' : 'none'} ` }} className="align-col-text-center" width={'5%'} >{totalComment}</td>
                                                    <td style={{ backgroundColor: `${isSmartSearch.col === 6 ? '#edfaff' : 'none'} ` }} className="align-col-text-center" width={'5%'}>{totalReplies}</td>
                                                    <td /*style={{ backgroundColor: `${isSmartSearch.col === 7 ? '#edfaff' : 'none'} ` }}*/ width={'10%'} style={{ backgroundColor: `${getCellColor(statusCell)}` }}>{answeredBy ? <Anchor href={data.answer?.AnswerUrl} target="_blank">{answeredBy}</Anchor> : statusCell}</td>
                                                    <td style={{ backgroundColor: `${isSmartSearch.col === 8 ? '#edfaff' : 'none'} ` }} width={'10%'}>{answeredCreatedAy !== 'Invalid Date' ? answeredCreatedAy : ''}</td>
                                                    <td style={{ backgroundColor: `${isSmartSearch.col === 9 ? '#edfaff' : 'none'} ` }} width={'10%'}>{updatedAt}</td>
                                                    <td style={{ backgroundColor: `${isSmartSearch.col === 10 ? '#edfaff' : 'none'} ` }} width={'10%'}>{createdAt}</td>

                                                </tr>
                                            })
                                        }
                                    </tbody>
                                }</>
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