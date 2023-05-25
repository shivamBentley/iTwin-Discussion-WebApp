import { useEffect, useState } from "react";
import { Checkbox, Headline, Input } from '@itwin/itwinui-react';
import { useDispatch, useSelector } from "react-redux";
import { setFilter, setFilteredDiscussionData } from "../../store/reducers/discussion";
import { getFilteredDataByDeveloperAndStatusType } from "../../helper/util";

export const MultiInputFilter = ({ types, setTypes, developers, setDeveloper }) => {

    const dispatch = useDispatch();
    const discussionData = useSelector((state) => state.discussion.discussionData.discussionData)
    const filter = useSelector((state) => state.discussion.filter)

    const handelTypeClick = (e) => {
        setTypes({ ...types, [e.target.name]: e.target.checked });
        updateStore('typeFilterKey', filter.typeFilterKey, e)
    }
    const [developerData, setDeveloperData] = useState([]);
    const [filterKey, setFilterKey] = useState('');

    const handelDevClick = (e) => {
        const newDevFilter = developers.map((obj) => {
            if (obj.name === e.target.name) {
                return { ...obj, isChecked: e.target.checked }
            }
            else return obj
        })
        setDeveloper(newDevFilter);
        updateStore('developerFilterKey', filter.developerFilterKey, e)
    }

    const updateStore = (targetFilter, preData, e) => {
        // updating store 
        let newDeveloperFilterData;
        if (e.target.checked) {
            newDeveloperFilterData = [...preData]
            newDeveloperFilterData.push(e.target.name);
        } else {
            newDeveloperFilterData = [...preData]
            const index = newDeveloperFilterData.indexOf(e.target.name);
            if (index > -1) {
                newDeveloperFilterData.splice(index, 1);
            }
        }

        if (newDeveloperFilterData.length !== 0) {
            dispatch(setFilter({ filter: { ...filter, [targetFilter]: newDeveloperFilterData } }))
        } else {
            dispatch(setFilter({ filter: { ...filter, [targetFilter]: [] } }))
        }

    }

    const handleSearch = (e) => {
        const key = e.target.value;
        const filteredData = developers.filter((obj) => {
            return obj.name.toLowerCase().includes(key.toLowerCase())
        })
        setDeveloperData(filteredData);
        setFilterKey(e.target.value);
    }

    useEffect(() => {
        dispatch(setFilteredDiscussionData({ filteredDiscussionData: getFilteredDataByDeveloperAndStatusType(discussionData, filter.developerFilterKey, filter.typeFilterKey) }))
    }, [filter])

    useEffect(() => {
        if (filterKey !== '') {
            const filteredData = developers.filter((obj) => {
                return obj.name.toLowerCase().includes(filterKey.toLowerCase())
            })
            setDeveloperData(filteredData);
        }
    })

    useEffect(() => {
        setDeveloperData(developers)
    }, [developers])

    return (
        <div style={{ minHeight: 350 }}>

            {/* {JSON.stringify(filter)} */}
            <div style={{ display: 'flex' }}>
                <div>
                    <div >
                        <Headline style={{ fontSize: '1rem' }}>Select Type</Headline>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '-25px' }}>
                            <Checkbox label={'Answered'} name="answer" checked={types.answer} onChange={handelTypeClick} style={{ marginRight: '10px' }} />
                            <Checkbox label={'Commented'} name="comments" onChange={handelTypeClick} checked={types.comments} style={{ marginRight: '10px' }} />
                            <Checkbox label={'Replied'} name="replies" onChange={handelTypeClick} checked={types.replies} />
                        </div>
                    </div>
                    <div >
                        <Headline style={{ fontSize: '1rem' }}>Select developer</Headline>
                        <div style={{ marginTop: '-25px' }}>
                            <Input placeholder='Search developer' size="medium" name={'inputFilter'} value={filterKey} onChange={handleSearch} />
                            <div style={{ maxHeight: '200px', overflow: 'scroll', border: '1px solid skyblue', paddingLeft: '5px' }}>
                                {
                                    developerData.map((obj, index) => (
                                        <Checkbox key={index} label={obj.name} name={obj.name} checked={obj.isChecked} onChange={handelDevClick} />
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{borderLeft:'1px solid skyblue' , marginLeft:'10px', paddingLeft:'10px', width:'180px'}}>
                    <div style={{ margin: '60% 0 0 0' }}>
                        <Headline style={{ fontSize: '1rem' }}>Selected Developers</Headline>
                        {filter.developerFilterKey.length !== 0 ?
                            <div style={{marginTop:'-30px', maxHeight: '180px',overflow: 'scroll'}}>
                            {
                                developers.map((obj, index) => {
                                    if (obj.isChecked)
                                        return <Checkbox key={index} label={obj.name} name={obj.name} checked={obj.isChecked} onChange={handelDevClick} />
                                })
                            }
                        </div> : <div style={{fontSize:'10px' , textAlign:'center', color:'red'}}>No Selection</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};