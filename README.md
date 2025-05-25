# Personal Budget Tracker - Frontend

A modern and responsive web application for managing personal finances, built with React and Material-UI.

## Features

- **User Authentication**: Secure login/logout functionality
- **Dashboard**: Overview of financial status with charts and summaries
- **Budget Management**: Set and track budgets by category
- **Transaction Tracking**: Record and manage income/expenses
- **Visual Analytics**: 
  - Monthly trends chart
  - Expenses by category visualization
  - Budget progress tracking
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **React**: Frontend framework
- **Material-UI**: UI component library
- **D3.js**: Data visualization
- **Axios**: HTTP client
- **React Router**: Navigation
- **Notistack**: Toast notifications
- **JWT**: Authentication

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with:
   ```
   VITE_API_URL=http://localhost:8000/api
   ```

## Running the Application

```bash
npm run dev
```

The application will start on `http://localhost:5173`

## Project Structure

```
src/
├── components/         # Reusable UI components
├── context/           # React context providers
├── pages/             # Page components
├── services/          # API services
└── utils/             # Helper functions
```

## Login Credentials

- **Username**: demo
- **Password**: demo123

## Environment Variables

- `VITE_API_URL`: Backend API URL (default: http://localhost:8000/api)

## Third-Party Libraries

- **@mui/material**: Material-UI components
- **@mui/icons-material**: Material icons
- **d3**: Data visualization
- **notistack**: Toast notifications
- **axios**: HTTP client
- **react-router-dom**: Routing

## Development Assumptions

1. Single user mode (no multi-user support in demo)
2. All amounts are in Indian Rupees (₹)
3. Monthly budget cycles (no custom date ranges)
4. Categories are predefined
5. No data export/import functionality

## Acknowledgments

- Material-UI for the component library
- D3.js for visualization capabilities
- React and its ecosystem
- LLM assistance in code development and documentation

## Contributing

Feel free to submit issues and enhancement requests.

## License

MIT License
