import { Anchor, DropdownButton, MenuItem } from "@itwin/itwinui-react";
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
        return [25, 50, 100].map((size) => <MenuItem key={0} onClick={handleClick(size, close)}>{size} per page</MenuItem>);
    }

    const updateData = (data) => {
        const end = currentIndex * rowsPerPage;
        const start = end - rowsPerPage;
        const newDataSet = data.slice(start, end);
        setData(newDataSet);

    }

    useEffect(() => {
        if (isFiltered.isAny) {
            setDataLength(filteredData.length)
            updateData(filteredData)


        } else {
            setDataLength(discussionData.length)
            updateData(discussionData);


        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [discussionData, isFiltered, filteredData, currentIndex, rowsPerPage])

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

                                                return <tr key={index} className="data-row">
                                                    <td width={'2%'}>{(currentIndex - 1) * rowsPerPage + index + 1}</td>
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

                            {dataLength > rowsPerPage && <li li className={`page-item ${currentIndex === lastIndex ? "active" : ''}`} >
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