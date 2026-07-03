from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select
from typing import Optional
import shutil, uuid, os

from ..database import get_session
from ..models import Produto, ProdutoCreate, ProdutoRead, ProdutoUpdate

router = APIRouter(prefix="/produtos", tags=["produtos"])

UPLOAD_DIR = "static/uploads"


@router.get("/", response_model=list[ProdutoRead])
def listar_produtos(
    categoria: Optional[str] = None,
    apenas_ativos: bool = True,
    session: Session = Depends(get_session),
):
    query = select(Produto)
    if apenas_ativos:
        query = query.where(Produto.ativo == True)
    if categoria:
        query = query.where(Produto.categoria == categoria)
    return session.exec(query.order_by(Produto.categoria, Produto.nome)).all()


@router.get("/{produto_id}", response_model=ProdutoRead)
def obter_produto(produto_id: int, session: Session = Depends(get_session)):
    produto = session.get(Produto, produto_id)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return produto


@router.post("/", response_model=ProdutoRead, status_code=201)
def criar_produto(produto: ProdutoCreate, session: Session = Depends(get_session)):
    db_produto = Produto.model_validate(produto)
    session.add(db_produto)
    session.commit()
    session.refresh(db_produto)
    return db_produto


@router.patch("/{produto_id}", response_model=ProdutoRead)
def atualizar_produto(
    produto_id: int,
    produto: ProdutoUpdate,
    session: Session = Depends(get_session),
):
    db_produto = session.get(Produto, produto_id)
    if not db_produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    data = produto.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(db_produto, key, value)
    session.add(db_produto)
    session.commit()
    session.refresh(db_produto)
    return db_produto


@router.delete("/{produto_id}", status_code=204)
def deletar_produto(produto_id: int, session: Session = Depends(get_session)):
    produto = session.get(Produto, produto_id)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    session.delete(produto)
    session.commit()


@router.post("/{produto_id}/imagem", response_model=ProdutoRead)
async def upload_imagem(
    produto_id: int,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    produto = session.get(Produto, produto_id)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(status_code=400, detail="Formato inválido. Use JPEG, PNG ou WebP.")

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    dest = os.path.join(UPLOAD_DIR, filename)
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    produto.imagem_url = f"/static/uploads/{filename}"
    session.add(produto)
    session.commit()
    session.refresh(produto)
    return produto
