from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Optional

from ..database import get_session
from ..models import (
    Pedido, PedidoCreate, PedidoRead, PedidoStatusUpdate,
    ItemPedido, Produto,
)

router = APIRouter(prefix="/pedidos", tags=["pedidos"])

STATUSES_VALIDOS = ("recebido", "preparo", "pronto", "entregue", "cancelado")


@router.get("/", response_model=list[PedidoRead])
def listar_pedidos(
    status: Optional[str] = None,
    session: Session = Depends(get_session),
):
    query = select(Pedido)
    if status:
        query = query.where(Pedido.status == status)
    pedidos = session.exec(query.order_by(Pedido.criado_em.desc())).all()
    return _hydrate(pedidos, session)


@router.get("/{pedido_id}", response_model=PedidoRead)
def obter_pedido(pedido_id: int, session: Session = Depends(get_session)):
    pedido = session.get(Pedido, pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return _hydrate([pedido], session)[0]


@router.post("/", response_model=PedidoRead, status_code=201)
def criar_pedido(payload: PedidoCreate, session: Session = Depends(get_session)):
    if not payload.itens:
        raise HTTPException(status_code=422, detail="O pedido deve ter ao menos 1 item")

    pedido = Pedido(
        nome_cliente=payload.nome_cliente,
        observacao=payload.observacao,
    )
    session.add(pedido)
    session.flush()  # gera o id do pedido

    total = 0.0
    for item_data in payload.itens:
        produto = session.get(Produto, item_data.produto_id)
        if not produto or not produto.ativo:
            raise HTTPException(
                status_code=404,
                detail=f"Produto {item_data.produto_id} não encontrado ou inativo",
            )
        item = ItemPedido(
            pedido_id=pedido.id,
            produto_id=item_data.produto_id,
            quantidade=item_data.quantidade,
            preco_unitario=produto.preco,
        )
        total += produto.preco * item_data.quantidade
        session.add(item)

    pedido.total = round(total, 2)
    session.add(pedido)
    session.commit()
    session.refresh(pedido)
    return _hydrate([pedido], session)[0]


@router.patch("/{pedido_id}/status", response_model=PedidoRead)
def atualizar_status(
    pedido_id: int,
    payload: PedidoStatusUpdate,
    session: Session = Depends(get_session),
):
    if payload.status not in STATUSES_VALIDOS:
        raise HTTPException(status_code=422, detail=f"Status inválido: {payload.status}")
    pedido = session.get(Pedido, pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    pedido.status = payload.status
    session.add(pedido)
    session.commit()
    session.refresh(pedido)
    return _hydrate([pedido], session)[0]


# ─── helpers ────────────────────────────────────────────────────────────────

def _hydrate(pedidos: list[Pedido], session: Session) -> list[PedidoRead]:
    """Carrega itens + produtos para cada pedido sem N+1 queries."""
    if not pedidos:
        return []
    ids = [p.id for p in pedidos]
    itens = session.exec(
        select(ItemPedido).where(ItemPedido.pedido_id.in_(ids))
    ).all()
    produto_ids = list({i.produto_id for i in itens})
    produtos = {
        p.id: p
        for p in session.exec(select(Produto).where(Produto.id.in_(produto_ids))).all()
    }
    itens_by_pedido: dict[int, list] = {}
    for item in itens:
        itens_by_pedido.setdefault(item.pedido_id, []).append(item)

    result = []
    for pedido in pedidos:
        pedido_itens = itens_by_pedido.get(pedido.id, [])
        itens_read = []
        for it in pedido_itens:
            from ..models import ItemPedidoRead, ProdutoRead
            prod = produtos.get(it.produto_id)
            itens_read.append(
                ItemPedidoRead(
                    id=it.id,
                    pedido_id=it.pedido_id,
                    produto_id=it.produto_id,
                    quantidade=it.quantidade,
                    preco_unitario=it.preco_unitario,
                    produto=ProdutoRead.model_validate(prod) if prod else None,
                )
            )
        from ..models import PedidoRead
        result.append(
            PedidoRead(
                id=pedido.id,
                nome_cliente=pedido.nome_cliente,
                observacao=pedido.observacao,
                status=pedido.status,
                total=pedido.total,
                criado_em=pedido.criado_em,
                itens=itens_read,
            )
        )
    return result
