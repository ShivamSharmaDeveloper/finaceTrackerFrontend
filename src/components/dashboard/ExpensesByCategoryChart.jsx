import React, { useRef, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import * as d3 from 'd3';

const ExpensesByCategoryChart = ({ data, height }) => {
  const theme = useTheme();
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !chartRef.current) return;

    const processedData = Array.isArray(data) 
      ? d3.rollup(
          data.filter(t => t.type === 'expense'),
          v => d3.sum(v, d => parseFloat(d.amount || 0)),
          d => d.category_name || 'Uncategorized'
        )
      : new Map(Object.entries(data));

    const chartData = Array.from(processedData, ([category, amount]) => ({
      category_name: category === 'null' || !category ? 'Uncategorized' : category,
      amount: parseFloat(amount || 0)
    }))
    .filter(d => d.amount > 0)
    .sort((a, b) => b.amount - a.amount);

    if (chartData.length === 0) return;

    d3.select(chartRef.current).selectAll('*').remove();

    const width = chartRef.current.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 70, left: 60 };
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
      .domain(chartData.map(d => d.category_name))
      .range([0, innerWidth])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, d => d.amount) * 1.1])
      .range([innerHeight, 0]);

    const color = d3
      .scaleOrdinal()
      .domain(chartData.map(d => d.category_name))
      .range(chartData.map(d => 
        d.category_name === 'Uncategorized' 
          ? theme.palette.grey[400]
          : theme.palette.primary.main
      ));

    svg
      .selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.category_name))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.amount))
      .attr('height', d => innerHeight - y(d.amount))
      .attr('fill', d => color(d.category_name))
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('opacity', d => d.category_name === 'Uncategorized' ? 0.7 : 0.9)
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 1);
      })
      .on('mouseout', function(event, d) {
        d3.select(this).attr('opacity', d.category_name === 'Uncategorized' ? 0.7 : 0.9);
      });

    svg
      .selectAll('.label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .attr('x', d => x(d.category_name) + x.bandwidth() / 2)
      .attr('y', d => y(d.amount) - 5)
      .text(d => `₹${d.amount.toFixed(2)}`)
      .attr('font-size', '11px')
      .attr('font-weight', d => d.category_name === 'Uncategorized' ? 'normal' : 'medium')
      .attr('fill', theme.palette.text.secondary);

    svg
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .attr('font-size', '11px')
      .attr('fill', d => d === 'Uncategorized' ? theme.palette.text.secondary : theme.palette.text.primary);

    svg
      .append('g')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat(d => `₹${d.toLocaleString()}`)
      )
      .selectAll('text')
      .attr('font-size', '11px')
      .attr('fill', theme.palette.text.secondary);

    svg
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', theme.palette.text.primary)
      .text('Monthly Expenses by Category');
  }, [data, theme]);

  return (
    <Box
      ref={chartRef}
      sx={{
        width: '100%',
        height: height || 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {(!data || data.length === 0) && 'No expense data available'}
    </Box>
  );
};

export default ExpensesByCategoryChart;