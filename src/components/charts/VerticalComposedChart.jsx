import React, {  } from 'react';
import {
    ComposedChart,

    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Brush,
} from 'recharts';

export default function VerticalComposedChart({ data, bar1Color = "#8884d8", bar2Color = "#82ca9d", }) {
    const initialRange = { start: 10, end: 20 };

    return (

        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
                layout="vertical"
                width={500}
                height={400}
                data={data}
                margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 90,
                }}
            >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis type="number" />
                <YAxis dataKey="developer" type="category" scale='band' />
                <Tooltip />
                <Legend />
                <Brush dataKey="developer" height={30} stroke="#8884d8" startIndex={initialRange.start} endIndex={initialRange.end} />
                <Bar dataKey="commented" stackId="a" fill={`${bar1Color}`} />
                <Bar dataKey="answered" stackId="a" fill={`${bar2Color}`} />
            </ComposedChart>
        </ResponsiveContainer>


    );

}
