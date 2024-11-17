from pydantic import BaseModel
from pydantic_settings import BaseSettings
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from langchain.chat_models import AzureChatOpenAI
from langchain_experimental.agents import create_pandas_dataframe_agent
from langchain.sql_database import SQLDatabase
from langchain_experimental.sql import SQLDatabaseChain
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Azure OpenAI Settings
    AZURE_OPENAI_API_KEY: str
    AZURE_OPENAI_ENDPOINT: str
    AZURE_DEPLOYMENT_NAME: str
    AZURE_API_VERSION: str
    
    # File Settings
    CSV_FILE_PATH: str
    EXCEL_FILE_PATH: str
    
    # PostgreSQL Settings
    DB_HOST: str
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str
    DB_PORT: str
    
    class Config:
        env_file = ".env"

settings = Settings()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    question: str
    mode: str = "csv"

# Initialize CSV agent
try:
    df = pd.read_csv(settings.CSV_FILE_PATH)
    llm = AzureChatOpenAI(
        deployment_name=settings.AZURE_DEPLOYMENT_NAME,
        openai_api_key=settings.AZURE_OPENAI_API_KEY,
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_version=settings.AZURE_API_VERSION,
        temperature=0
    )
    csv_agent = create_pandas_dataframe_agent(
        llm,
        df,
        verbose=True,
        handle_parsing_errors="Check your output and make sure it conforms! Do not output an action and a final answer at the same time. Stop if you have a final answer.",
        allow_dangerous_code=True
    )
except Exception as e:
    print(f"Error initializing CSV agent: {e}")
    raise

# Initialize SQL agent
try:
    db_url = f"postgresql+psycopg2://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
    db = SQLDatabase.from_uri(db_url)
    db_chain = SQLDatabaseChain.from_llm(llm=llm, db=db, verbose=True)
except Exception as e:
    print(f"Error initializing SQL agent: {e}")
    raise

@app.post("/api/query")
async def query_data(query: Query):
    try:
        if query.mode == "sql":
            # SQL query
            result = db_chain.run(query.question)
            return {"result": result}
        else:
            # CSV query
            result = csv_agent.run(query.question)
            
            # Clean up the response
            if isinstance(result, str):
                # First try to extract content after "Final Answer:"
                if "Final Answer:" in result:
                    cleaned_result = result.split("Final Answer:")[1].split("\n")[0].strip()
                else:
                    cleaned_result = result
                
                # Remove common tokens
                tokens_to_remove = [
                    "<|im_end|>",
                    "<|im_sep|>",
                    "Final Answer:",
                    "Answer:",
                    "Response:",
                    "Action Input:",
                    "Thought:",
                    "Action:",
                    "I now know the final answer."
                ]
                
                for token in tokens_to_remove:
                    cleaned_result = cleaned_result.replace(token, "")
                
                # Clean up whitespace
                cleaned_result = cleaned_result.strip()
                
                # Try to extract list if present
                import re
                list_match = re.search(r'\[(.*?)\]', cleaned_result)
                if list_match:
                    # Extract the list content and convert to proper format
                    list_content = list_match.group(1)
                    try:
                        # Convert string of numbers to actual list
                        numbers = [int(x.strip()) for x in list_content.split(',')]
                        cleaned_result = numbers
                    except ValueError:
                        # If conversion fails, keep the original list string
                        pass
                
            else:
                cleaned_result = result
            
            return {"result": cleaned_result}
            
    except Exception as e:
        print(f"Error in query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "csv_file": settings.CSV_FILE_PATH,
        "csv_rows": len(df),
        "sql_connected": True if 'db_chain' in globals() else False
    }

@app.get("/")
async def serve_sample_page():
    return FileResponse("index.html")

@app.get("/widget.js")
async def serve_widget():
    return FileResponse("widget.js", media_type="application/javascript")