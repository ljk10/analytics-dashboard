# app.py
import os
import pandas as pd
from typing import Optional, List, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import create_engine, text

# --- Vanna V2 Imports (Correct, from V2 source) ---
from vanna import Agent, AgentConfig
from vanna.tools import RunSqlTool
from vanna.core.user import UserResolver, User, RequestContext
from vanna.integrations.local.agent_memory import DemoAgentMemory # Using Demo Memory as per the guide
from vanna.integrations.postgres import PostgresRunner # Official V2 Postgres integration
from vanna.servers.fastapi import VannaFastAPIServer # Import the server

# Our Groq adapter (this file is correct)
from llm_groq import GroqLlmService

# --- 1. Settings (Fix A from your guide) ---
class AppSettings(BaseSettings):
    GROQ_API_KEY: str
    DATABASE_URL: str
    GROQ_MODEL: str = "llama3-8b-8192"
    VN_TEMPERATURE: float = 0.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore", # This fixes the Pydantic validation error
    )

try:
    settings = AppSettings()
except Exception as e:
    print(f"CRITICAL ERROR: Could not load .env file. Make sure .env exists. Error: {e}")
    exit(1)


# --- 2. Setup Vanna + Groq + Postgres ---
# Use the official Vanna Postgres integration
# --- 2. Tool: Postgres runner (official integration) ---
db_tool = RunSqlTool(sql_runner=PostgresRunner(
    connection_string=settings.DATABASE_URL
))

# Plug in Groq as the LLM
llm = GroqLlmService(
    model=settings.GROQ_MODEL,
    api_key=settings.GROQ_API_KEY,
    temperature=settings.VN_TEMPERATURE,
)

# Use DemoAgentMemory as per the guide
agent_memory = DemoAgentMemory(max_items=1000)

# Use the SimpleUserResolver from the guide
class SimpleUserResolver(UserResolver):
    async def resolve_user(self, request_context: RequestContext) -> User:
        return User(id="default_user", email="default@example.com",
                    group_memberships=["admin", "user"])

user_resolver = SimpleUserResolver()

# --- 3. Create Your Agent ---
# We pass the 'llm_service' and other components as per the guide
agent = Agent(
    llm_service=llm, # The guide correctly uses 'llm_service'
    tools=[db_tool], # Pass tools as a list
    user_resolver=user_resolver,
    agent_memory=agent_memory,
    config=AgentConfig(temperature=settings.VN_TEMPERATURE)
)

# --- 4. Train the Agent (on startup) ---
print("Training Vanna...")
admin_user = User(id="admin", group_memberships=["admin"])
ddl_string = ""
try:
    # Use the SqlRunner from our tool to get the DDL
    df_ddl = db_tool.sql_runner.run("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public'")
    
    if df_ddl is not None:
        ddl_string = "\n".join(
            f"Table {row['table_name']} has column {row['column_name']} with type {row['data_type']};"
            for index, row in df_ddl.iterrows()
        )
except Exception as e:
    print(f"Could not introspect schema, using manual DDL. Error: {e}")
    # Fallback DDL
    ddl_string = """
    Table "Vendor" has column "id" with type integer; Table "Vendor" has column "name" with type character varying;
    Table "Invoice" has column "id" with type integer; Table "Invoice" has column "invoiceNumber" with type character varying;
    Table "Invoice" has column "issueDate" with type timestamp without time zone; Table "Invoice" has column "dueDate" with type timestamp without time zone;
    Table "Invoice" has column "totalAmount" with type numeric; Table "Invoice" has column "status" with type "InvoiceStatus";
    Table "Invoice" has column "vendorId" with type integer;
    """

# Add DDL to agent memory
if ddl_string:
    print("Training on DDL...")
    agent.agent_memory.add_document(ddl_string, user=admin_user)

print("Training on documentation...")
agent.agent_memory.add_document("The 'Invoice' table contains all invoices. The 'Vendor' table contains vendor information.", user=admin_user)
agent.agent_memory.add_document("The 'LineItem' table is empty and should not be used for queries.", user=admin_user)
print("Vanna training complete.")

# --- 5. Run the Server ---
# Use the VannaFastAPIServer, which automatically includes the /api/ask endpoint
server = VannaFastAPIServer(agent)
app = server.get_app()