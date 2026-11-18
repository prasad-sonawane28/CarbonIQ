from datetime import date
from typing import Literal
from pydantic import BaseModel, Field

Category = Literal["Electricity", "Fuel", "Transport", "Waste", "Process"]


class Credentials(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=100)


class LoginData(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RecordCreate(BaseModel):
    source: str = Field(min_length=1, max_length=100)
    category: Category
    amount: float = Field(gt=0)
    date: date


class RecordOut(RecordCreate):
    id: int

    model_config = {"from_attributes": True}
