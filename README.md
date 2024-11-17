

# AI Chat Widget with CSV & SQL Support

## Overview
This project implements a versatile chat widget that can query both CSV files and SQL databases using Azure OpenAI's LLMs and LangChain. The widget can be easily embedded into any website and supports two modes of operation:
- CSV file analysis
- SQL database querying

## Features
- Floating chat widget interface
- Real-time AI responses
- Support for both CSV and SQL data sources
- Azure OpenAI integration
- Easy website embedding

## Prerequisites
- Python 3.11+
- Azure OpenAI API access
- PostgreSQL database (for SQL mode)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file with your credentials:
```env
# Azure OpenAI
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_ENDPOINT=your-endpoint
AZURE_DEPLOYMENT_NAME=your-deployment
AZURE_API_VERSION=azure-api-version

# CSV
CSV_FILE_PATH=/path/to/your/file.csv

# PostgreSQL
DB_HOST=your-host
DB_USER=your-user
DB_PASSWORD=your-password
DB_NAME=your-database
DB_PORT=5432
```

## Usage

1. Start the server:
```bash
uvicorn main:app --reload
```

2. Add the widget to your website:
```html
<script>
    window.CHAT_CONFIG = {
        apiUrl: 'http://your-server-url'
    };
</script>
<script src="http://your-server-url/widget.js"></script>
```

## API Endpoints

- `POST /api/query`: Submit questions to the AI
  - Parameters:
    - `question`: The user's question
    - `mode`: "csv" or "sql" (defaults to "csv")
- `GET /health`: Server health check
- `GET /`: Serves sample webpage
- `GET /widget.js`: Serves the widget JavaScript

## Development

For local development with ngrok:
```bash
ngrok http 8000
```

This will create a public URL for testing the widget on external websites.

## Project Structure

```
.
├── main.py              # FastAPI server implementation
├── widget.js            # Frontend chat widget
├── requirements.txt     # Python dependencies
├── .env                # Environment variables (create this)
└── README.md
```

## Security Notes
- CORS is currently configured to allow all origins
- SQL queries are executed through a secure chain
- CSV file access is restricted to server-side
- Use environment variables for sensitive information
- Implement proper authentication in production

## Troubleshooting

Common issues:
1. CORS errors: Check your API URL configuration
2. Database connection: Verify PostgreSQL credentials
3. File not found: Check CSV file path
4. Azure OpenAI errors: Verify API credentials