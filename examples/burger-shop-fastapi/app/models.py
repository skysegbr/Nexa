from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship


# ─── Produto ────────────────────────────────────────────────────────────────

class ProdutoBase(SQLModel):
    nome: str = Field(min_length=2, max_length=120)
    descricao: str = Field(default="", max_length=500)
    preco: float = Field(gt=0)
    categoria: str = Field(default="lanche")   # lanche | bebida | acompanhamento | sobremesa
    imagem_url: str = Field(default="")
    ativo: bool = Field(default=True)


class Produto(ProdutoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    itens: list["ItemPedido"] = Relationship(back_populates="produto")


class ProdutoCreate(ProdutoBase):
    pass


class ProdutoUpdate(SQLModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    preco: Optional[float] = None
    categoria: Optional[str] = None
    imagem_url: Optional[str] = None
    ativo: Optional[bool] = None


class ProdutoRead(ProdutoBase):
    id: int


# ─── Pedido ─────────────────────────────────────────────────────────────────

class ItemPedidoBase(SQLModel):
    produto_id: int = Field(foreign_key="produto.id")
    quantidade: int = Field(ge=1)
    preco_unitario: float


class ItemPedido(ItemPedidoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id")
    produto: Optional[Produto] = Relationship(back_populates="itens")
    pedido: Optional["Pedido"] = Relationship(back_populates="itens")


class ItemPedidoRead(ItemPedidoBase):
    id: int
    produto: Optional[ProdutoRead] = None


class ItemPedidoCreate(SQLModel):
    produto_id: int
    quantidade: int = Field(ge=1)


class PedidoBase(SQLModel):
    nome_cliente: str = Field(min_length=2, max_length=120)
    observacao: str = Field(default="", max_length=500)


class Pedido(PedidoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    status: str = Field(default="recebido")   # recebido | preparo | pronto | entregue | cancelado
    total: float = Field(default=0.0)
    criado_em: datetime = Field(default_factory=datetime.utcnow)
    itens: list[ItemPedido] = Relationship(back_populates="pedido")


class PedidoCreate(PedidoBase):
    itens: list[ItemPedidoCreate]


class PedidoRead(PedidoBase):
    id: int
    status: str
    total: float
    criado_em: datetime
    itens: list[ItemPedidoRead] = []


class PedidoStatusUpdate(SQLModel):
    status: str
