import React, { useRef, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import * as d3 from 'd3';

const ExpensesByCategoryChart = ({ data }) => {
  const theme = useTheme();
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !chartRef.current) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();

    // Set up dimensions
    const width = chartRef.current.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 50, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3
      .scaleBand()
      .domain(data.map(d => d.category))
      .range([0, innerWidth])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.amount) * 1.1])
      .range([innerHeight, 0]);

    // Create color scale
    const color = d3
      .scaleOrdinal()
      .domain(data.map(d => d.category))
      .range([
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.error.main,
        theme.palette.warning.main,
        theme.palette.success.main,
        theme.palette.info.main,
        '#9c27b0',
        '#795548',
        '#607d8b',
      ]);

    // Add the bars
    svg
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.category))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.amount))
      .attr('height', d => innerHeight - y(d.amount))
      .attr('fill', d => color(d.category))
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('opacity', 0.9)
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 1);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.9);
      });

    // Add value labels on top of bars
    svg
      .selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .attr('x', d => x(d.category) + x.bandwidth() / 2)
      .attr('y', d => y(d.amount) - 5)
      .text(d => `$${d.amount.toFixed(0)}`)
      .attr('font-size', '10px')
      .attr('fill', theme.palette.text.secondary);

    // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .attr('font-size', '10px');

    // Add Y axis
    svg
      .append('g')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat(d => `$${d}`)
      )
      .selectAll('text')
      .attr('font-size', '10px');

    // Add title
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
        height: 300,
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