from collections import defaultdict

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
from auth import create_token, get_current_user, hash_password, verify_password
from database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CarbonIQ API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/auth/register", response_model=schemas.Token, status_code=201)
def register(data: schemas.Credentials, db: Session = Depends(get_db)):
    if db.query(models.User).filter_by(username=data.username).first():
        raise HTTPException(status_code=409, detail="Username already taken")
    user = models.User(
        username=data.username, password_hash=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return schemas.Token(access_token=create_token(user.id))


@app.post("/api/auth/login", response_model=schemas.Token)
def login(data: schemas.LoginData, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.username).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Wrong username or password")
    return schemas.Token(access_token=create_token(user.id))


@app.get("/api/records", response_model=list[schemas.RecordOut])
def list_records(
    user: models.User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return (
        db.query(models.Record)
        .filter_by(user_id=user.id)
        .order_by(models.Record.date.desc(), models.Record.id.desc())
        .all()
    )


@app.post("/api/records", response_model=schemas.RecordOut, status_code=201)
def create_record(
    data: schemas.RecordCreate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = models.Record(user_id=user.id, **data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@app.delete("/api/records/{record_id}", status_code=204)
def delete_record(
    record_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.query(models.Record).filter_by(id=record_id, user_id=user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()


@app.get("/api/summary")
def summary(
    user: models.User = Depends(get_current_user), db: Session = Depends(get_db)
):
    records = db.query(models.Record).filter_by(user_id=user.id).all()
    by_month, by_category = defaultdict(float), defaultdict(float)
    for r in records:
        by_month[r.date.strftime("%Y-%m")] += r.amount
        by_category[r.category] += r.amount
    return {
        "total": round(sum(by_month.values()), 2),
        "by_month": [
            {"month": m, "amount": round(a, 2)} for m, a in sorted(by_month.items())
        ],
        "by_category": [
            {"category": c, "amount": round(a, 2)}
            for c, a in sorted(by_category.items(), key=lambda x: -x[1])
        ],
    }
