from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    records = relationship(
        "Record", back_populates="user", cascade="all, delete-orphan"
    )


class Record(Base):
    __tablename__ = "records"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    source = Column(String, nullable=False)    # e.g. "Plant 1 boiler"
    category = Column(String, nullable=False)  # Electricity, Fuel, Transport...
    amount = Column(Float, nullable=False)     # kg CO2e
    date = Column(Date, nullable=False)
    user = relationship("User", back_populates="records")
