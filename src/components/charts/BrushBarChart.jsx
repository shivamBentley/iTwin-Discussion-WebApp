import React, { PureComponent } from 'react';
import {
    BarChart,
    Bar,
    Brush,
    ReferenceLine,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';


class CustomizedAxisTick extends PureComponent {
    render() {
        const { x, y, payload } = this.props;
        return (
            <g transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-0)">
                    {payload.value}
                </text>
            </g>
        );
    }
}


function BrushBarChart({ data, bar1Color = "#8884d8", bar2Color = "#82ca9d", }) {
    const initialRange = { start: 10, end: 20 };
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                width={500}
                height={300}
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="developer" tick={<CustomizedAxisTick />} />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
                <ReferenceLine y={0} stroke="#000" />
                <Brush dataKey="developer" height={30} stroke="#8884d8" startIndex={initialRange.start} endIndex={initialRange.end} />
                <Bar dataKey="commented" stackId="a" fill={`${bar1Color}`} />
                <Bar dataKey="answered" stackId="a" fill={`${bar2Color}`} />
            </BarChart>
        </ResponsiveContainer>
    )
}

export default BrushBarChart
