/* eslint-disable max-classes-per-file */
/* eslint-disable react/no-multi-comp */
import React, { PureComponent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

class CustomizedLabel extends PureComponent {
    render() {
        const { x, y, stroke, value } = this.props;

        return (
            <text x={x} y={y} dy={-4} fill={stroke} fontSize={10} textAnchor="middle">
                {value}
            </text>
        );
    }
}

class CustomizedAxisTick extends PureComponent {
    render() {
        const { x, y, payload } = this.props;

        return (
            <g transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">
                    {payload.value}
                </text>
            </g>
        );
    }
}


function CustomizedLabelLineChart({
    data = [],
    key1Color = '#6600cc',
    key2Color = "#4a8a2e",
    key3Color = "#bda800",
    key4Color = "#3BB2B2"
}) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                width={500}
                height={300}
                data={data}
                margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 10,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" height={60} tick={<CustomizedAxisTick />} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="queryCreated" stroke={`${key1Color}`} label={<CustomizedLabel />} />
                <Line type="monotone" dataKey="queryAnswered" stroke={`${key2Color}`} />
                <Line type="monotone" dataKey="developers" stroke={`${key3Color}`} />
                <Line type="monotone" dataKey="queryCommented" stroke={`${key4Color}`} />
            </LineChart>
        </ResponsiveContainer>
    )
}

export default CustomizedLabelLineChart