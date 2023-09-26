import React, { useCallback } from 'react'
import CustomizedLabelLineChart from './CustomizedLabelLineChart'
import CustomActiveShapePieChart from './CustomActiveShapePieChart'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
    GetAnsweredData,
    GetCommentedData,
    getAllDevelopers,
    getCommentedOnlyDataByDeveloper,
    getAnsweredDataByDeveloper,
    GetNoRepliedData
} from '../../helper/discussion'

import {
    Headline, DropdownButton,
    MenuItem,
} from '@itwin/itwinui-react'
import { sortFunc } from '../../helper/util'
import { useEffect } from 'react'
import VerticalComposedChart from './VerticalComposedChart'
import { BENTLEY_DEVELOPERS_LIST } from '../../db/local-database'

const getCategoryDetails = (discussionsData) => {
    // filtering by categories ...
    const categoryMap = new Map();

    const COLORS = new Map([
        ['Q&A', '#8884d8'],
        ['Announcements', '#0088FE'],
        ['General', '#3BB2B2'],
        ['Ideas', '#dbc300'],
        ['Polls', 'violet'],
        ['Proposals', '#FFBB28'],
        ['Show and tell', '#00C49F']
    ]);

    discussionsData.forEach((data) => {
        if (data.category.categoryName) {
            const found = categoryMap.get(data.category.categoryName)
            if (!found) {
                categoryMap.set(data.category.categoryName, 1);
            } else {
                categoryMap.set(data.category.categoryName, found + 1)
            }
        }
    })
    const categoryData = Array.from(categoryMap, function (item) {
        return { name: item[0], value: item[1], color: COLORS.get(item[0]) }
    });
    return categoryData
}

const getContributionData = (discussionsData) => {
    return [
        { name: 'Answered', value: GetAnsweredData(discussionsData).length, color: '#6DB56E' },
        { name: 'Commented', value: GetCommentedData(discussionsData).length, color: '#8884d8' },
        { name: 'No Reply', value: GetNoRepliedData(discussionsData).length, color: '#bf0000' }
    ]
}

const getDeveloperContribution = (discussionData) => {
    const developers = Array.from(getAllDevelopers(discussionData));
    const res = []
    developers.forEach((dev) => {
        const devCommentedData = getCommentedOnlyDataByDeveloper(discussionData, dev);
        const devAnsweredData = getAnsweredDataByDeveloper(discussionData, dev);
        // const devRepliedData = getRepliedDataByDeveloper(discussionData, dev).length;

        // Get developer location & company name
        let developerDetails = null;
        if (devAnsweredData.length > 0) {
            developerDetails = { ...devAnsweredData[0].answer.author }
        } else if (devCommentedData.length > 0) {
            const comments = devCommentedData[0]?.comments;
            if (comments.totalCount !== 0) {
                comments.nodes.forEach((comment) => {
                    if (comment.author.DeveloperCommented === dev)
                        developerDetails = { ...comment.author }
                })
            }
        }

        res.push({ developer: dev, answered: devAnsweredData.length, commented: devCommentedData.length, developerDetails });
    })
    return res;
}


const getMonthlyContribution = (discussionData) => {
    const MonthlyContributionMapData = new Map();

    discussionData.forEach((data) => {
        const commentsData = new Map();
        const developerData = new Map();

        data.comments?.nodes.forEach((comment) => {
            const createdAt = comment?.createdAt.substr(0, 7);

            const developer = comment.author.DeveloperCommented;
            const found = developerData.get(createdAt);
            if (!found) {
                developerData.set(createdAt, new Set([developer]));
            } else {
                const newSet = found.add(developer);
                developerData.set(createdAt, newSet);
            }

            const foundDateInCommentsData = commentsData.get(createdAt);
            if (!foundDateInCommentsData) {
                commentsData.set(createdAt, 1)
            } else {
                commentsData.set(createdAt, foundDateInCommentsData + 1)
            }
        })

        const initData = {
            queryAnswered: 0,
            queryCommented: 0,
            queryCreated: 0,
            developers: new Set(),
        }

        // update for answer
        if (data.answer?.AnswerCreatedAt) {
            const answeredDate = data.answer?.AnswerCreatedAt.substr(0, 7);
            const answerFound = MonthlyContributionMapData.get(answeredDate)
            if (!answerFound) {
                MonthlyContributionMapData.set(answeredDate, { ...initData, queryAnswered: 1 });
            } else {
                MonthlyContributionMapData.set(answeredDate, { ...answerFound, queryAnswered: answerFound.queryAnswered + 1 })
            }
        }

        // update for created
        if (data.createdAt) {
            const createdDate = data.createdAt.substr(0, 7);
            const createdFound = MonthlyContributionMapData.get(createdDate)
            if (!createdFound) {
                MonthlyContributionMapData.set(createdDate, { ...initData, queryCreated: 1 });
            } else {
                MonthlyContributionMapData.set(createdDate, { ...createdFound, queryCreated: createdFound.queryCreated + 1 })
            }
        }

        // update for comments 
        Array.from(commentsData, (item) => {
            return { date: item[0], value: item[1] }
        }).forEach(element => {
            const found = MonthlyContributionMapData.get(element.date);
            if (!found) {
                MonthlyContributionMapData.set(element.date, { ...initData, queryCommented: element.value });
            } else {
                MonthlyContributionMapData.set(element.date, { ...found, queryCommented: (found.queryCommented + element.value) });
            }
        });

        // update for developer 
        Array.from(developerData, (item) => {
            return { date: item[0], developers: item[1] }
        }).forEach(element => {
            const found = MonthlyContributionMapData.get(element.date);
            if (!found) {
                MonthlyContributionMapData.set(element.date, { ...initData, developers: element.developers });
            } else {
                MonthlyContributionMapData.set(element.date, { ...found, developers: new Set([...found.developers, ...element.developers]) });
            }
        });
    })

    let res = Array.from(MonthlyContributionMapData, (item) => {
        const key = item[0];
        const value = item[1];

        return { date: key + '-01', ...value, developers: value.developers.size }
    })

    res = sortFunc(res, 'date', 'ASC', 'date').map((data) => {
        return { ...data, date: data.date.substr(0, 7) };
    })
    return res;
}



function ReportCharts() {
    const discussionsData = useSelector((state) => state.discussions.discussionData);
    const [contribution,] = useState(() => getContributionData(discussionsData), [])
    const [category,] = useState(() => getCategoryDetails(discussionsData), [])
    const [monthlyContribution, setMonthlyContribution] = useState(() => getMonthlyContribution(discussionsData), []);
    const [devContribution, setDeveloperContribution] = useState(() => getDeveloperContribution(discussionsData), []);
    const [activeYear, setActiveYear] = useState('All');
    const [activeDevData, setDevData] = useState("All Developer's");
    const [activeSort, setSort] = useState('Developer')


    //menuItem list 
    const getYearMenuItems = useCallback((close) => {
        const years = new Set();
        const currentYear = new Date().getFullYear();

        for (let year = 2020; year <= currentYear; year++) {
            years.add(year.toString());
        }
        const menuItems = Array.from(years).map((obj, index) => {
            return <MenuItem key={index + 1} onClick={() => {
                setActiveYear(obj)
                close();
            }}>{obj}
            </MenuItem>
        })

        menuItems.push(<MenuItem key={0} onClick={() => {
            setActiveYear('All')
            close();
        }}>{'All'}
        </MenuItem>)
        return menuItems;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //menuItem list 
    const getDevMenuItems = useCallback((close) => {
        const menuItems = [
            <MenuItem key={0} onClick={() => { setDevData('All Developers'); close(); }}>{"All Developers"}</MenuItem>,
            <MenuItem key={1} onClick={() => { setDevData('Contributed Developer'); close(); }}>{'Contributed Developer'}</MenuItem>,
            <MenuItem key={1} onClick={() => { setDevData('Bentley Developers'); close(); }}>{'Bentley Developers'}</MenuItem>

        ]
        return menuItems;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const getSortMenuItems = useCallback((close) => {
        const menuItems = [
            <MenuItem key={0} onClick={() => { setSort('Developer'); close(); }}>{'Developer'}</MenuItem>,
            <MenuItem key={1} onClick={() => { setSort('Answered'); close(); }}>{"Answered"}</MenuItem>,
            <MenuItem key={2} onClick={() => { setSort('Commented'); close(); }}>{'Commented'}</MenuItem>
        ]
        return menuItems;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (activeYear === 'All') {
            setMonthlyContribution(getMonthlyContribution(discussionsData));
        } else {
            const filterMonthlyContributionData = getMonthlyContribution(discussionsData).filter(data => {
                return (data.date.substr(0, 4) === activeYear)
            });
            setMonthlyContribution(filterMonthlyContributionData);
        }
    }, [activeYear, discussionsData]);

    useEffect(() => {
        let filteredData = getDeveloperContribution(discussionsData);
        switch (activeSort) {
            case "Answered":
                sortFunc(filteredData, 'answered', 'DSC', 'number')
                break;
            case "Commented":
                sortFunc(filteredData, 'commented', 'DSC', 'number')
                break;
            default:
                sortFunc(filteredData, 'developer', 'ASC', 'string')
                break;
        }

        if (activeDevData === "Contributed Developer") {
            filteredData = filteredData.filter(data => {
                return data.answered !== 0 || data.commented !== 0
            })
        } else if (activeDevData === 'Bentley Developers') {
            const companies = new Set();
            // filter bentley developers
            filteredData = filteredData.filter((data) => {

                companies.add(data.developerDetails?.company)

                // check if developer exist in bentleyDeveloperList 
                const isInBentleyDeveloperList = BENTLEY_DEVELOPERS_LIST.find(dev => (data.developer).toLowerCase() === dev.toLowerCase())
                const isBentleyDev = (data.developerDetails?.company && (data.developerDetails.company).toLowerCase().includes('bentley'))
                return isBentleyDev || isInBentleyDeveloperList

            })
            console.log(companies)
        }
        setDeveloperContribution(filteredData)
    }, [activeSort, activeDevData, discussionsData])

    return (
        <>
            <div style={{ width: '100%', height: '120%' }}>
                <div style={{ width: '100%', height: '350px', display: 'flex', border: '1px solid lightgray', marginBottom: '30px', position: 'relative' }}>
                    <div style={{ width: '50%', height: '350px', }}>
                        <Headline style={{ fontSize: '20px', padding: '0 20px', fontWeight: '400', position: 'absolute' }}>Contribution</Headline>
                        <CustomActiveShapePieChart data={contribution} />
                    </div>
                    <div style={{ width: '50%', height: '350px' }}>
                        <Headline style={{ fontSize: '20px', padding: '0 20px', fontWeight: '400', position: 'absolute', }}>Category</Headline>
                        <CustomActiveShapePieChart data={category} color={'skyblue'} />
                    </div>
                </div >
                <div style={{ width: '100%', height: '110%' }}>
                    <div style={{ width: '100%', height: '50%', padding: '5px 0 80px 0', margin: '0 0 30px 0', border: '1px solid lightgray' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Headline style={{ fontSize: '20px', padding: '0 20px', fontWeight: '400' }}>Monthly Contribution</Headline>
                            <DropdownButton size='small' style={{ height: '30px', margin: '10px 10px 0 0' }} menuItems={(close) => getYearMenuItems(close)}>
                                {`${activeYear}`}
                            </DropdownButton>
                        </div>
                        <CustomizedLabelLineChart data={monthlyContribution} />
                    </div>
                    <div style={{ width: '100%', height: '50%', padding: '5px 0 80px 0', border: '1px solid lightgray' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                            <Headline style={{ fontSize: '20px', padding: '0 20px', fontWeight: '400' }}>Developer's Contribution</Headline>
                            <div>
                                <DropdownButton size='small' style={{ height: '30px', margin: '10px 10px 0 0' }} menuItems={(close) => getSortMenuItems(close)}>
                                    {`${activeSort}`}
                                </DropdownButton>
                                <DropdownButton size='small' style={{ height: '30px', margin: '10px 10px 0 0' }} menuItems={(close) => getDevMenuItems(close)}>
                                    {`${activeDevData}`}
                                </DropdownButton>
                            </div>

                            <span style={{ position: 'absolute', top: '50px', right: '20px' }}>Total Developer's : {devContribution.length}</span>
                        </div>
                        <VerticalComposedChart data={devContribution} />
                    </div>

                </div>

            </div>
        </>
    )
}

export default ReportCharts

