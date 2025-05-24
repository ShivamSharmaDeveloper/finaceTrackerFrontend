import React, { useRef, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import * as d3 from 'd3';

const MonthlyTrendsChart = ({ data }) => {
  const theme = useTheme();
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !chartRef.current) return;

    d3.select(chartRef.current).selectAll('*').remove();

    const width = chartRef.current.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.income, d.expenses)) * 1.1])
      .range([innerHeight, 0]);

    const incomeLine = d3
      .line()
      .x(d => x(d.month) + x.bandwidth() / 2)
      .y(d => y(d.income))
      .curve(d3.curveMonotoneX);

    const expenseLine = d3
      .line()
      .x(d => x(d.month) + x.bandwidth() / 2)
      .y(d => y(d.expenses))
      .curve(d3.curveMonotoneX);

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', theme.palette.success.main)
      .attr('stroke-width', 3)
      .attr('d', incomeLine);

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', theme.palette.error.main)
      .attr('stroke-width', 3)
      .attr('d', expenseLine);

    svg
      .selectAll('.income-dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'income-dot')
      .attr('cx', d => x(d.month) + x.bandwidth() / 2)
      .attr('cy', d => y(d.income))
      .attr('r', 5)
      .attr('fill', theme.palette.success.main)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    svg
      .selectAll('.expense-dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'expense-dot')
      .attr('cx', d => x(d.month) + x.bandwidth() / 2)
      .attr('cy', d => y(d.expenses))
      .attr('r', 5)
      .attr('fill', theme.palette.error.main)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    svg
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'middle')
      .attr('font-size', '10px');

    svg
      .append('g')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat(d => `₹${d}`)
      )
      .selectAll('text')
      .attr('font-size', '10px');

    const legend = svg
      .append('g')
      .attr('transform', `translate(${innerWidth - 100}, 0)`);

    legend
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', theme.palette.success.main);

    legend
      .append('text')
      .attr('x', 18)
      .attr('y', 10)
      .text('Income')
      .style('font-size', '12px')
      .attr('alignment-baseline', 'middle');

    legend
      .append('rect')
      .attr('x', 0)
      .attr('y', 20)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', theme.palette.error.main);

    legend
      .append('text')
      .attr('x', 18)
      .attr('y', 30)
      .text('Expenses')
      .style('font-size', '12px')
      .attr('alignment-baseline', 'middle');
  }, [data, theme]);

  return (
    <Box
      ref={chartRef}
      sx={{
        width: '100%',
        height: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {(!data || data.length === 0) && 'No trend data available'}
    </Box>
  );
};

export default MonthlyTrendsChart;